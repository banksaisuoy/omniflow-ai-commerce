import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  CommandDialog,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/stores/i18nStore";
import { supabase } from "@/integrations/supabase/client";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const { data: products } = useQuery({
    queryKey: ['global-search-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, thumbnail_url, price')
        .eq('status', 'active')
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("search_placeholder")} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {products && products.length > 0 && (
            <>
              <CommandGroup heading={t("products")}>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => runCommand(() => navigate(`/product/${product.slug}`))}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{product.name}</span>
                    <span className="text-muted-foreground">฿{product.price.toLocaleString()}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          <CommandGroup heading={t("pages")}>
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              {t("home")}
