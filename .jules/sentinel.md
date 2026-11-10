## 2024-05-24 - [FloatingContact Reverse Tabnabbing]
**Vulnerability:** Found `window.open` calls opening external and internal links with `_blank` without specifying `noopener,noreferrer`.
**Learning:** This exposes the application to reverse tabnabbing attacks, where a maliciously controlled target page could use `window.opener` to redirect the parent page.
**Prevention:** When using `window.open` with `_blank` as the target, explicitly include `'noopener,noreferrer'` as the window features argument.
