import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hidden md:inline-flex"
        onClick={() => setOpen(true)}
        title={`${t("search")} (⌘K)`}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{t("search")}</span>
      </Button>

      {/* Mobile version */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
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
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/products"))}>
              {t("products")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/bundles"))}>
              {t("bundles")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/gift-cards"))}>
              {t("gift_cards")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/blog"))}>
              {t("blog")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/loyalty"))}>
              {t("rewards")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/track"))}>
              {t("track")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
