import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "@/prisma/generated/prisma";
import {
  Calendar,
  DollarSign,
  Percent,
  Package as PackageIcon,
} from "lucide-react";

interface PackageCardProps {
  package: Package;
}

const PackageCard = ({ package: packageData }: PackageCardProps) => {
  const formatPrice = (price: string | null) => {
    if (!price) return "Not set";
    return `$${price}`;
  };

  const formatDiscount = (discount: string | null) => {
    if (!discount) return null;
    return `${discount}%`;
  };

  const formatValidity = (validDays: string | null) => {
    if (!validDays) return "Not set";
    return `${validDays} days`;
  };

  const hasDiscount =
    packageData.packageDiscount && parseFloat(packageData.packageDiscount) > 0;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 max-w-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {packageData.packageName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="ml-2">
              Package
            </Badge>
            {hasDiscount && (
              <Badge variant="secondary" className="text-xs">
                Discount Available
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {packageData.packageDescription}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <PackageIcon className="h-4 w-4" />
          <span>Package Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{formatPrice(packageData.packagePrice)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatValidity(packageData.validDays)}</span>
          </div>
        </div>

        {hasDiscount && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Percent className="h-4 w-4" />
            <span>{formatDiscount(packageData.packageDiscount)} discount</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Created: {new Date(packageData.createdAt).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter className="flex h-full justify-between items-end pt-3">
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="default" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
