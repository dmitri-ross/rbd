// components/SwapBlock.tsx

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Web3Button, useAddress, useSDK } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import {
  contractAddresses,
  erc20ABI,
  tokenSwapAddress,
  tokenSwapAbi,
} from "../../const/contracts";
import { FaExchangeAlt } from "react-icons/fa";

const SwapBlock = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const address = useAddress();
  const sdk = useSDK();

  const { inCurrency, outCurrency } = router.query;

  const tokenOptions = ["RUB", "USDC", "DAI", "USDT"];
  const tokenSymbols: { [key: string]: string } = {
    RUB: "RUBi",
    USDC: "USDC",
    DAI: "DAI",
    USDT: "USDT",
  };

  const [fromToken, setFromToken] = useState<string>("USDT");
  const [toToken, setToToken] = useState<string>("RUB");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [amountInWei, setAmountInWei] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [fromDecimals, setFromDecimals] = useState<number | null>(null);
  const [toDecimals, setToDecimals] = useState<number | null>(null);
  const [rate, setRate] = useState<string>("Загрузка...");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from("0"));
  const [fromBalance, setFromBalance] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [toReserves, setToReserves] = useState<BigNumber>(BigNumber.from("0"));
  const [dots, setDots] = useState("");

  useEffect(() => {
    console.log( inCurrency, outCurrency );
    // Допустимые валюты
    const validTokens = ["RUB", "USDC", "DAI", "USDT"];

    // Проверяем и устанавливаем fromToken
    if (
      inCurrency &&
      typeof inCurrency === "string" &&
      validTokens.includes(inCurrency.toUpperCase())
    ) {
      setFromToken(inCurrency.toUpperCase());
    } else {
      setFromToken("USDT"); // Значение по умолчанию
    }

    // Проверяем и устанавливаем toToken
    if (
      outCurrency &&
      typeof outCurrency === "string" &&
      validTokens.includes(outCurrency.toUpperCase())
    ) {
      setToToken(outCurrency.toUpperCase());
    } else {
      setToToken("RUB"); // Значение по умолчанию
    }
    
    console.log(fromToken, toToken);
  }, [inCurrency, outCurrency]);

  useEffect(() => {
    if (!address) return;

    const initContracts = async () => {
      if (sdk && contractAddresses[fromToken] && contractAddresses[toToken]) {
        const fromTokenContract = await sdk.getContractFromAbi(
          contractAddresses[fromToken],
          erc20ABI
        );
        const toTokenContract = await sdk.getContractFromAbi(
          contractAddresses[toToken],
          erc20ABI
        );

        const [
          fromTokenDecimals,
          allowance,
          fromBalance,
          toTokenDecimals,
          toReserves,
        ] = await Promise.all([
          fromTokenContract.call("decimals"),
          fromTokenContract.call("allowance", [address, tokenSwapAddress]),
          fromTokenContract.call("balanceOf", [address]),
          toTokenContract.call("decimals"),
          toTokenContract.call("balanceOf", [tokenSwapAddress]),
        ]);

        setFromDecimals(Number(fromTokenDecimals));
        setToDecimals(Number(toTokenDecimals));
        setAllowance(BigNumber.from(allowance));
        setFromBalance(BigNumber.from(fromBalance));
        setToReserves(BigNumber.from(toReserves));
      }
    };
    initContracts();
  }, [sdk, fromToken, toToken, address]);

  useEffect(() => {
    if (inputAmount === "") {
      setAmountInWei(BigNumber.from("0"));
      return;
    }

    if (fromDecimals !== null) {
      if (
        Number(inputAmount) >
        Number(ethers.utils.formatUnits(fromBalance, fromDecimals))
      ) {
        setInputAmount(ethers.utils.formatUnits(fromBalance, fromDecimals));
      }

      if (/^\d*\.?\d*$/.test(inputAmount)) {
        try {
          const weiAmount = ethers.utils.parseUnits(inputAmount, fromDecimals);
          setAmountInWei(weiAmount);
          fetchAllowance();
        } catch (error) {
          console.error("Ошибка при конвертации суммы:", error);
        }
      }
    }
  }, [inputAmount, fromDecimals]);

  useEffect(() => {
    const fetchRate = async () => {
      if (
        sdk &&
        fromDecimals !== null &&
        toDecimals !== null &&
        contractAddresses[fromToken] &&
        contractAddresses[toToken]
      ) {
        const tokenSwapContract = await sdk.getContractFromAbi(
          tokenSwapAddress,
          tokenSwapAbi
        );
        const oneUnit = ethers.utils.parseUnits("1", fromDecimals);
        const amountOut = await tokenSwapContract.call("calculateAmountOut", [
          contractAddresses[fromToken],
          contractAddresses[toToken],
          oneUnit,
        ]);
        const formattedRate = ethers.utils.formatUnits(amountOut, toDecimals);
        setRate(formattedRate);
      } else {
        setRate("Загрузка...");
      }
    };
    fetchRate();
  }, [sdk, fromToken, toToken, fromDecimals, toDecimals]);

  const fetchAllowance = async () => {
    if (sdk && contractAddresses[fromToken]) {
      const fromTokenContract = await sdk.getContractFromAbi(
        contractAddresses[fromToken],
        erc20ABI
      );
      const allowance = await fromTokenContract.call("allowance", [
        address,
        tokenSwapAddress,
      ]);
      setAllowance(BigNumber.from(allowance));
    }
  };

  const handleSwap = async () => {
    if (amountInWei.lte(0)) {
      alert("Введите корректную сумму!");
      return;
    }

    const outputAmount = Number(inputAmount) * Number(rate);
    const outputAmountWei = ethers.utils.parseUnits(
      outputAmount.toFixed(toDecimals || 18),
      toDecimals || 18
    );

    if (outputAmountWei.gt(toReserves)) {
      alert("Недостаточно резервов для обмена. Уменьшите сумму.");
      return;
    }

    try {
      setIsSwapping(true);

      const fromTokenContract = await sdk.getContractFromAbi(
        contractAddresses[fromToken],
        erc20ABI
      );
      const tokenSwapContract = await sdk.getContractFromAbi(
        tokenSwapAddress,
        tokenSwapAbi
      );

      if (allowance.lt(amountInWei)) {
        await fromTokenContract.call("approve", [
          tokenSwapAddress,
          amountInWei,
        ]);
        setAllowance(amountInWei);
      }

      await tokenSwapContract.call("swapTokens", [
        contractAddresses[fromToken],
        contractAddresses[toToken],
        amountInWei,
      ]);

      onOpen();
    } catch (error) {
      console.error("Обмен не удался:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    if (isSwapping) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots("");
    }
  }, [isSwapping]);

  const handleCloseModal = () => {
    onOpenChange();
    router.push(`/transactions/${toToken}`);
  };

  const handleSwapTokens = () => {
    if (fromToken === toToken) {
      alert("Невозможно обменять на ту же валюту.");
      return;
    }
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleFromTokenChange = (key: string) => {
    if (key === toToken) {
      alert("Невозможно выбрать ту же валюту.");
      return;
    }
    setFromToken(key);
  };

  const handleToTokenChange = (key: string) => {
    if (key === fromToken) {
      alert("Невозможно выбрать ту же валюту.");
      return;
    }
    setToToken(key);
  };

  return (
    <>
      <div className="swap-container">
        <div className="swap-input">
          <div className="input-group">
            <label>Продаю</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={inputAmount}
              required
              placeholder={`Ваш баланс: ${
                fromDecimals !== null
                  ? ethers.utils.formatUnits(fromBalance, fromDecimals)
                  : "Загрузка..."
              } ${tokenSymbols[fromToken]}`}
              onChange={(e) => setInputAmount(e.target.value)}
            />
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button className="swap-currency" variant="bordered">
                {tokenSymbols[fromToken]}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Выберите валюту продажи"
              onAction={(key) => handleFromTokenChange(key as string)}
            >
              {tokenOptions.map((token) => (
                <DropdownItem key={token}>{tokenSymbols[token]}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="swap-arrow" onClick={handleSwapTokens}>
          <FaExchangeAlt />
        </div>

        <div className="swap-input">
          <div className="input-group">
            <label>Покупаю</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={
                rate && inputAmount
                  ? (Number(inputAmount) * Number(rate)).toFixed(6)
                  : ""
              }
              placeholder={`0.00`}
              disabled
            />
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button className="swap-currency" variant="bordered">
                {tokenSymbols[toToken]}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Выберите валюту покупки"
              onAction={(key) => handleToTokenChange(key as string)}
            >
              {tokenOptions.map((token) => (
                <DropdownItem key={token}>{tokenSymbols[token]}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="swap-details">
          <p>
            Курс обмена: 1 {tokenSymbols[fromToken]} = {rate}{" "}
            {tokenSymbols[toToken]}
          </p>
          <p>
            Резерв:{" "}
            {toDecimals !== null
              ? ethers.utils.formatUnits(toReserves, toDecimals)
              : "Загрузка..."}{" "}
            {tokenSymbols[toToken]}
          </p>
        </div>

        <Web3Button
          className="swap-button"
          contractAddress={tokenSwapAddress}
          action={handleSwap}
          isDisabled={
            isSwapping ||
            Number(inputAmount) * Number(rate) >
              Number(ethers.utils.formatUnits(toReserves, toDecimals || 18))
          }
        >
          {isSwapping ? `Идет обмен${dots}` : "Обменять"}
        </Web3Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleCloseModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="fixed-modeal-header">
                Обмен успешно завершен
              </ModalHeader>
              <ModalBody>
                <p>Ваш обмен был успешно завершен!</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleCloseModal}>
                  Закрыть
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SwapBlock;
