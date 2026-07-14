import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

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

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

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
        <CommandInput placeholder={t("search_pages")} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
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
