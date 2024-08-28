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
  import { FaArrowDown } from "react-icons/fa";
  
  export const SwapBlock = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();
    const address = useAddress();
    const sdk = useSDK();
  
    const tokenOptions = ["RUB", "USD", "CNY", "USDT"];
    const tokenSymbols = { RUB: "RUBi", USD: "USDi", CNY: "CNYi", USDT: "USDT" };
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
          const oneEtherInWei = ethers.utils.parseUnits("1", fromDecimals);
          const amountOut = await tokenSwapContract.call("calculateAmountOut", [
            contractAddresses[fromToken],
            contractAddresses[toToken],
            oneEtherInWei,
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
      setFromToken(toToken);
      setToToken(fromToken);
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
        <div className="swap-container dark">
          <div className="swap-input dark">
            <Input
              className="token-input r dark"
              type="number"
              step="0.01"
              label="Продаю"
              min="0.01"
              value={inputAmount}
              required
              placeholder={`Ваш Баланс: ${
                fromDecimals !== null
                  ? ethers.utils.formatUnits(fromBalance, fromDecimals)
                  : "Загрузка..."
              } ${tokenSymbols[fromToken]}`}
              onChange={(e) => setInputAmount(e.target.value)}
            />
  
            <Dropdown className="dark">
              <DropdownTrigger className="dark">
                <Button className="dark" variant="bordered">
                  {tokenSymbols[fromToken]}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select From Token"
                onAction={(key) => handleFromTokenChange(key as string)}
              >
                {tokenOptions.map((token) => (
                  <DropdownItem key={token}>{tokenSymbols[token]}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
  
          <div className="dark swap-arrow" onClick={handleSwapTokens}>
            <FaArrowDown />
          </div>
  
          <div className="swap-input dark">
            <Input
              className="token-input dark"
              type="number"
              step="0.01"
              label="Покупаю"
              min="0.01"
              value={
                rate && inputAmount
                  ? (Number(inputAmount) * Number(rate)).toFixed(6)
                  : "Загрузка..."
              }
              placeholder={`0.00`}
              disabled
            />
  
            <Dropdown className="dark">
              <DropdownTrigger>
                <Button variant="bordered">{tokenSymbols[toToken]}</Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select To Token"
                onAction={(key) => handleToTokenChange(key as string)}
              >
                {tokenOptions.map((token) => (
                  <DropdownItem key={token}>{tokenSymbols[token]}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="exchange-rate dark">
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
            {/* <p>Путь обмена: {exchangePath}</p> */}
          </div>
          <Web3Button
            className="swap-button dark"
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
          className="swap-modal dark"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onClose={handleCloseModal}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="modal-header">
                  Обмен успешно завершен
                </ModalHeader>
                <ModalBody>
                  <p>Ваш обмен был успешно завершен!</p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={handleCloseModal}
                  >
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
  