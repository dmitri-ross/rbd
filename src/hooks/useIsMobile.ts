// hooks/useIsMobile.ts

import { useState, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Функция для обновления состояния
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Определяем мобильное устройство как ширина <= 768px
    };

    // Выполняем первоначальную проверку
    handleResize();

    // Добавляем слушатель события resize
    window.addEventListener("resize", handleResize);

    // Убираем слушатель при размонтировании компонента
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export default useIsMobile;
