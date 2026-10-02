import { listCategories } from "@/lib/catalog";
import Link from "next/link";
import {
  Truck,
  ShoppingCart,
  Package,
  Ship,
  Warehouse,
  Car,
  Network,
  Cpu,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  logistica: Truck,
  procurement: ShoppingCart,
  compras: Package,
  importacao: Ship,
  armazem: Warehouse,
  frotas: Car,
  "supply-chain": Network,
  "tecnologia-logistica": Cpu,
};

export async function CategoryGrid() {
  const categories = await listCategories();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 lg:gap-4">
      {categories.map((cat) => {
        const Icon = iconMap[cat.slug] ?? Package;
        return (
          <Link
            key={cat.id}
            href={`/ebooks?categoria=${cat.slug}`}
            className="surface-card surface-card-hover group flex flex-col items-start gap-4 p-5 lg:p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark transition-colors group-hover:bg-mesclar-black group-hover:text-mesclar-gold-light">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold leading-snug text-mesclar-black group-hover:text-mesclar-gold-dark">
              {cat.name}
            </span>
            <span className="text-[11px] text-mesclar-muted">
              {cat.subcategories.length} subáreas
            </span>
          </Link>
        );
      })}
    </div>
  );
}
