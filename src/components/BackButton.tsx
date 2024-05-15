import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useRouter } from "next/router";
export const BackButton = () => {
  const router = useRouter();
  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Breadcrumbs className="dark mg-10">
        <BreadcrumbItem onClick={goBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Назад
        </BreadcrumbItem>
      </Breadcrumbs>
    </>
  );
};
