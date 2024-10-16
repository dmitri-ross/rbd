import { en} from "@thirdweb-dev/react";

const russian = en( {
    connectWallet: {
        signIn: "Войти",
        defaultButtonTitle: "Войти",
        connecting: "Вход",
        switchNetwork: "Сменить сеть",
        switchingNetwork: "Переключение сети",
        defaultModalTitle: "Вход",
        recommended: "Рекомендуемые",
        installed: "Установлено",
        continueAsGuest: "Продолжить как гость",
        connectAWallet: "Подключите кошелек",
        newToWallets: "Новичок в кошельках?",
        getStarted: "Начать",
        guest: "Гость",
        send: "Отправить",
        receive: "Получить",
        currentNetwork: "Текущая сеть",
        switchAccount: "Сменить аккаунт",
        requestTestnetFunds: "Запросить тестовые средства",
        transactionHistory: "История транзакций",
        backupWallet: "Резервное копирование кошелька",
        guestWalletWarning:
          "Это временный гостевой кошелек. Сделайте резервную копию, если не хотите потерять доступ",
        switchTo: "Переключиться на",
        connectedToSmartWallet: "Подключено",
        confirmInWallet: "Подтвердите в кошельке",
        disconnectWallet: "Выйти",
        copyAddress: "Копировать адрес",
        personalWallet: "Личный кошелек",
        smartWallet: "Умный аккаунт",
        or: "ИЛИ",
        goBackButton: "Назад",
        download: {
          chrome: "Скачать расширение для Chrome",
          android: "Скачать в Google Play",
          iOS: "Скачать в App Store",
        },
        welcomeScreen: {
          defaultTitle: "Ваш вход в децентрализованный мир",
          defaultSubtitle: "Подключите кошелек, чтобы начать",
        },
        agreement: {
          prefix: "Подключаясь, вы соглашаетесь с",
          termsOfService: "Условиями обслуживания",
          and: "и",
          privacyPolicy: "Политикой конфиденциальности",
        },
        networkSelector: {
          title: "Выберите сеть",
          mainnets: "Основные сети",
          testnets: "Тестовые сети",
          allNetworks: "Все",
          addCustomNetwork: "Добавить собственную сеть",
          inputPlaceholder: "Поиск сети или ID цепочки",
          categoryLabel: {
            recentlyUsed: "Недавно использованные",
            popular: "Популярные",
            others: "Все сети",
          },
          loading: "Загрузка",
          failedToSwitch: "Не удалось переключить сеть",
        },
        receiveFundsScreen: {
          title: "Получение средств",
          instruction: "Скопируйте адрес кошелька для отправки средств на этот кошелек",
        },
        sendFundsScreen: {
          title: "Отправка средств",
          submitButton: "Отправить",
          token: "Токен",
          sendTo: "Отправить к",
          amount: "Сумма",
          successMessage: "Транзакция выполнена успешно",
          invalidAddress: "Неверный адрес",
          noTokensFound: "Токены не найдены",
          searchToken: "Поиск или вставка адреса токена",
          transactionFailed: "Транзакция не удалась",
          transactionRejected: "Транзакция отклонена",
          insufficientFunds: "Недостаточно средств",
          selectTokenTitle: "Выберите токен",
          sending: "Отправка",
        },
        signatureScreen: {
          instructionScreen: {
            title: "Вход",
            instruction: "Пожалуйста, подпишите запрос сообщения в вашем кошельке, чтобы продолжить",
            signInButton: "Войти",
            disconnectWallet: "Отключить кошелек",
          },
          signingScreen: {
            title: "Вход...",
            prompt: "Подпишите запрос подписи в вашем кошельке",
            promptForSafe: "Подпишите запрос подписи в вашем кошельке и утвердите транзакцию в Safe",
            approveTransactionInSafe: "Утвердить транзакцию в Safe",
            tryAgain: "Попробуйте снова",
            failedToSignIn: "Не удалось войти",
            inProgress: "Ожидание подтверждения",
          },
        },
      },
      wallets: {
        walletConnect: {
          scanInstruction: "Отсканируйте это с помощью приложения вашего кошелька, чтобы подключиться",
        },
        smartWallet: {
          connecting: "Подключение к аккаунту",
          failedToConnect: "Не удалось подключиться к умному аккаунту",
          wrongNetworkScreen: {
            title: "Подключение...",
            subtitle: "",
            failedToSwitch: "Не удалось переключить сеть",
          },
        },
        safeWallet: {
          connectWalletScreen: {
            title: "Связать личный кошелек",
            subtitle: "Подключите ваш личный кошелек для использования Safe.",
            learnMoreLink: "Узнать больше",
          },
          accountDetailsScreen: {
            title: "Введите детали вашего сейфа",
            findSafeAddressIn: "Вы можете найти адрес вашего сейфа в",
            dashboardLink: "Панели Safe",
            network: "Сеть Safe",
            selectNetworkPlaceholder: "Сеть, в которой развернут ваш сейф",
            invalidChainConfig: "Невозможно использовать Safe: в приложении не настроены поддерживаемые сейфом цепочки",
            failedToConnect: "Не удалось подключиться к Safe. Убедитесь, что адрес сейфа и сеть указаны верно.",
            failedToSwitch: "Не удалось переключить сеть",
            switchNetwork: "Сменить сеть",
            switchingNetwork: "Переключение сети",
            connectToSafe: "Подключиться к Safe",
            connecting: "Подключение",
            mainnets: "Основные сети",
            testnets: "Тестовые сети",
            safeAddress: "Адрес Safe",
          },
        },
      
        paperWallet: {
            signIn: "Войти",
            signInWithGoogle: "Войти через Google",
            emailPlaceholder: "Введите ваш адрес электронной почты",
            submitEmail: "Продолжить",
            invalidEmail: "Неверный адрес электронной почты",
            emailRequired: "Требуется адрес электронной почты",
            googleLoginScreen: {
              title: "Войти",
              instruction: "Выберите вашу учетную запись Google во всплывающем окне",
              failed: "Не удалось войти",
              retry: "Попробовать снова",
            },
            emailLoginScreen: {
              title: "Войти",
              enterCodeSendTo: "Введите код подтверждения, отправленный на", // Введите код подтверждения, отправленный на + <email>
              newDeviceDetected: "Обнаружено новое устройство",
              enterRecoveryCode: "Введите код восстановления, отправленный вам при первой регистрации",
              invalidCode: "Неверный код подтверждения",
              invalidCodeOrRecoveryCode: "Неверный код подтверждения или код восстановления",
              verify: "Проверить",
              failedToSendCode: "Не удалось отправить код подтверждения",
              sendingCode: "Отправка кода подтверждения",
              resendCode: "Отправить код снова",
            },
          },
          embeddedWallet: {
            signInWithGoogle: "Войти через Google",
            signInWithFacebook: "Войти через Facebook",
            signInWithApple: "Войти через Apple",
            // signInWithEmail: "Войти через Email",
            emailPlaceholder: "Введите ваш адрес электронной почты",
            submitEmail: "Продолжить",
            signIn: "Войти",
            emailRequired: "Требуется адрес электронной почты",
            invalidEmail: "Неверный адрес электронной почты",
            maxAccountsExceeded: "Превышено максимальное количество учетных записей. Пожалуйста, уведомите разработчика приложения.",
            // invalidPhone: "Неверный номер телефона",
            // invalidEmailOrPhone: "Неверный адрес электронной почты или номер телефона",
            // countryCodeMissing: "Номер телефона должен начинаться с кода страны",
            // phonePlaceholder: "Введите номер телефона",
            // signInWithPhone: "Войти через номер телефона",
            // phoneRequired: "Требуется номер телефона",
            socialLoginScreen: {
              title: "Войти",
              instruction: "Войдите в свой аккаунт во всплывающем окне",
              failed: "Не удалось войти",
              retry: "Попробовать снова",
            },
            // otpLoginScreen: {
            //   title: "Войти",
            //   enterCodeSendTo: "Введите код подтверждения, отправленный на",
            //   newDeviceDetected: "Обнаружено новое устройство",
            //   enterRecoveryCode: "Введите код восстановления, отправленный вам при первой регистрации",
            //   invalidCode: "Неверный код подтверждения",
            //   invalidCodeOrRecoveryCode: "Неверный код подтверждения или код восстановления",
            //   verify: "Проверить",
            //   failedToSendCode: "Не удалось отправить код подтверждения",
            //   sendingCode: "Отправка кода подтверждения",
            //   resendCode: "Отправить код снова",
            // },
            createPassword: {
              title: "Создать пароль",
              instruction: "Установите пароль для вашего аккаунта. Этот пароль понадобится при подключении с нового устройства.",
              saveInstruction: "Не забудьте сохранить его",
              inputPlaceholder: "Введите ваш пароль",
              confirmation: "Я сохранил мой пароль",
              submitButton: "Установить пароль",
              failedToSetPassword: "Не удалось установить пароль",
            },
            enterPassword: {
              title: "Введите пароль",
              instruction: "Введите пароль для вашего аккаунта",
              inputPlaceholder: "Введите ваш пароль",
              submitButton: "Подтвердить",
              wrongPassword: "Неверный пароль",
            },
          },
          magicLink: {
            signIn: "Войти",
            loginWith: "Войти с помощью",
            submitEmail: "Продолжить",
            loginWithEmailOrPhone: "Войти с помощью электронной почты или номера телефона",
            emailOrPhoneRequired: "Требуется адрес электронной почты или номер телефона",
            loginWithPhone: "Войти через номер телефона",
            // phoneRequired: "Требуется номер телефона",
            invalidEmail: "Неверный адрес электронной почты",
            // invalidPhone: "Неверный номер телефона",
            // invalidEmailOrPhone: "Неверный адрес электронной почты или номер телефона",
            // countryCodeMissing: "Номер телефона должен начинаться с кода страны",
            emailPlaceholder: "Введите ваш адрес электронной почты",
            emailRequired: "Требуется адрес электронной почты",
          },
          localWallet: {
            passwordLabel: "Пароль",
            confirmPasswordLabel: "Подтвердите пароль",
            enterYourPassword: "Введите ваш пароль",
            warningScreen: {
              title: "Внимание",
              warning: "Ваш текущий кошелек будет удален при создании нового. Сделайте резервную копию кошелька на ваше устройство перед созданием нового кошелька",
              backupWallet: "Резервное копирование кошелька",
            },
            reconnectScreen: {
              title: "Подключиться к сохраненному кошельку",
              savedWallet: "Сохраненный кошелек",
              continue: "Продолжить",
              createNewWallet: "Создать новый кошелек",
            },
            createScreen: {
              instruction: "Выберите пароль для вашего кошелька. Вы сможете получить доступ и экспортировать этот кошелек с помощью того же пароля",
              importWallet: "Импортировать кошелек",
              createNewWallet: "Создать новый кошелек",
              connecting: "Подключение",
            },
            exportScreen: {
              description1: "Это действие загрузит файл JSON, содержащий информацию о кошельке на ваше устройство, зашифрованный с использованием пароля",
              description2: "Вы можете использовать этот файл JSON для импорта учетной записи в MetaMask с использованием того же пароля",
              walletAddress: "Адрес кошелька",
              download: "Скачать",
              title: "Резервное копирование кошелька",
            },
            importScreen: {
              title: "Импорт кошелька",
              description1: "Приложение может авторизовать любые транзакции от имени кошелька без каких-либо одобрений",
              description2: "Мы рекомендуем подключаться только к проверенным приложениям",
              import: "Импортировать",
              uploadJSON: "Загрузите файл JSON",
              uploadedSuccessfully: "Загружено успешно",
            },
          },
          frameWallet: {
            connectionFailedScreen: {
              title: "Не удалось подключиться к Frame",
              description: "Убедитесь, что настольное приложение установлено и запущено. Вы можете скачать Frame по ссылке ниже. После запуска Frame обновите эту страницу.",
              downloadFrame: "Скачать Frame",
              supportLink: "Продолжаются проблемы с подключением?",
            },
          },
        }
  
  });

  export default russian;