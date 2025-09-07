"use client";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const DynamicBreadCrumb = () => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ text: string; href: string }>
  >([]);

  useEffect(() => {
    const pathParts = pathname.split("/").filter((part) => part);
    const crumbs = pathParts.map((part, index) => {
      const href = `/${pathParts.slice(0, index + 1).join("/")}`;
      return {
        text: part.charAt(0).toUpperCase() + part.slice(1),
        href,
      };
    });
    setBreadcrumbs(crumbs);
  }, [pathname]);

  if (!breadcrumbs.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            Home
          </Link>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link
                href={crumb.href}
                className={
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium pointer-events-none"
                    : "text-gray-500 hover:text-gray-900"
                }
              >
                {crumb.text}
              </Link>
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadCrumb;
