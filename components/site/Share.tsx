"use client";

import { CheckIcon, FacebookLogoIcon, LinkSimpleIcon, WhatsappLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function Share({ url, title, labels }: { url: string; title: string; labels: { share: string; copyLink: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, Icon: WhatsappLogoIcon },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: FacebookLogoIcon },
    { label: "X", href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`, Icon: XLogoIcon },
  ];
  const btn = "grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-blue-200 hover:text-blue-700";
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-ink">{labels.share}</span>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${labels.share}: ${label}`} className={btn}>
          <Icon size={18} weight="fill" />
        </a>
      ))}
      <button
        type="button"
        className={btn}
        aria-label={copied ? labels.copied : labels.copyLink}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
      >
        {copied ? <CheckIcon size={18} weight="bold" className="text-green-700" /> : <LinkSimpleIcon size={18} weight="bold" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </div>
  );
}
