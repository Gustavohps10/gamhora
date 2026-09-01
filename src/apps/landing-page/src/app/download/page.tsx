'use client'

import { Button } from '@mr-tick/ui/components'
import {
  ArrowUpRight,
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  FileCode2,
  FolderArchive,
  GitBranch,
  Github,
  HardDrive,
  Package,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa'

import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'

export default function DownloadPage() {
  const [copiedSha, setCopiedSha] = React.useState<string | null>(null)
  const [copiedDocker, setCopiedDocker] = React.useState(false)

  const sha256Windows =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  const dockerComposeYaml = `version: '3.8'

services:
  mr-tick-sync:
    image: ghcr.io/gustavohps10/mr-tick-sync:latest
    container_name: mr-tick-sync-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - STORAGE_DRIVER=sqlite
      - JWT_SECRET=change-this-secret-key
    volumes:
      - ./data:/app/data`

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    if (id === 'docker') {
      setCopiedDocker(true)
      setTimeout(() => setCopiedDocker(false), 2000)
    } else {
      setCopiedSha(id)
      setTimeout(() => setCopiedSha(null), 2000)
    }
  }

  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background flex min-h-screen flex-col font-mono">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        {/* Header Hero Area */}
        <div className="container mx-auto px-6 text-center lg:px-8">
          <div className="border-border/80 bg-muted/50 text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium shadow-xs backdrop-blur-md transition-colors">
            <Sparkles className="size-3 text-emerald-500" />
            <span>Latest Release &middot; v0.1.0-beta</span>
          </div>

          <h1 className="text-foreground text-4xl font-normal tracking-tight sm:text-5xl md:text-6xl">
            Download
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
            Download the official desktop application or self-host the
            synchronization server.
          </p>
        </div>

        <div className="container mx-auto mt-12 max-w-6xl px-6 lg:px-8">
          {/* 1. Latest Build Banner (RPCS3 Style - max rounded-lg) */}
          <div className="border-border/80 bg-card/80 relative mb-10 overflow-hidden rounded-lg border p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="from-foreground/5 pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l to-transparent" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                <div className="border-border/80 bg-muted/60 flex size-14 shrink-0 items-center justify-center rounded-lg border shadow-inner">
                  <Image
                    src="/logo-icon.svg"
                    alt="Mr. Tick Icon"
                    width={32}
                    height={38}
                    className="h-8 w-auto object-contain dark:invert"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-foreground text-lg font-semibold sm:text-xl">
                      Build v0.1.0-beta.249
                    </h2>
                    <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Production Ready
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Released on August 31, 2026 &middot; Local-First Engine with
                    RxDB
                  </p>
                </div>
              </div>

              {/* Build Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://github.com/gustavohps10/mr-tick/pull/182"
                  target="_blank"
                  rel="noreferrer"
                  className="border-border/80 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
                >
                  <GitBranch className="size-3.5" />
                  <span>PR #182</span>
                </a>

                <a
                  href="https://github.com/gustavohps10/mr-tick/commit/c6e9672"
                  target="_blank"
                  rel="noreferrer"
                  className="border-border/80 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
                >
                  <Code2 className="size-3.5" />
                  <span>
                    Commit{' '}
                    <code className="text-foreground font-mono font-semibold">
                      c6e9672
                    </code>
                  </span>
                </a>

                <a
                  href="https://github.com/gustavohps10/mr-tick"
                  target="_blank"
                  rel="noreferrer"
                  className="border-border/80 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
                >
                  <Github className="size-3.5" />
                  <span>Source</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Platform OS Matrix (Windows, Linux, macOS - max rounded-lg) */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* WINDOWS CARD (ACTIVE - x64 Installer & Portable) */}
            <div className="border-border bg-card/90 hover:border-foreground/40 relative flex flex-col justify-between overflow-hidden rounded-lg border p-6 shadow-xl transition-all">
              <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/10 to-transparent" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FaWindows className="size-6 text-[#00adef]" />
                    <h3 className="text-foreground text-lg font-semibold">
                      Windows
                    </h3>
                  </div>
                  <span className="border-border/80 bg-muted/80 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                    64-bit
                  </span>
                </div>

                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                  For desktops and laptops running Windows 10 and Windows 11
                  (64-bit architecture).
                </p>

                {/* SHA-256 Box */}
                <div className="mt-4">
                  <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                    <span>SHA-256 Checksum</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(sha256Windows, 'win')}
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      {copiedSha === 'win' ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="border-border/70 bg-muted/40 text-muted-foreground mt-1.5 truncate rounded-lg border p-2 font-mono text-[10px]">
                    {sha256Windows}
                  </div>
                </div>
              </div>

              {/* Download Buttons: Installer & Portable */}
              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  asChild
                  className="bg-foreground text-background hover:bg-foreground/90 h-11 w-full justify-between rounded-lg px-4 text-xs font-semibold shadow-md"
                >
                  <a href="/downloads/app-setup.exe" download>
                    <span className="inline-flex items-center gap-2">
                      <Download className="size-4" />
                      Download x64 Installer
                    </span>
                    <span className="font-mono text-[10px] opacity-70">
                      Setup (.exe)
                    </span>
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border hover:bg-muted h-10 w-full justify-between rounded-lg px-4 text-xs font-medium"
                >
                  <a href="/downloads/app-portable.zip" download>
                    <span className="inline-flex items-center gap-2">
                      <FolderArchive className="text-muted-foreground size-4" />
                      Download x64 Portable
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      .zip
                    </span>
                  </a>
                </Button>
              </div>
            </div>

            {/* LINUX CARD (Coming Soon) */}
            <div className="border-border/70 bg-card/50 relative flex flex-col justify-between overflow-hidden rounded-lg border p-6 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FaLinux className="size-6 text-[#fcc624]" />
                    <h3 className="text-foreground text-lg font-semibold">
                      Linux
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    Em Breve
                  </span>
                </div>

                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                  For major Linux distributions (Ubuntu, Debian, Fedora, Arch)
                  via AppImage and .deb packages.
                </p>

                {/* Info Note */}
                <div className="border-border/50 bg-muted/30 text-muted-foreground mt-6 rounded-lg border p-3 text-xs">
                  <p className="text-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 text-amber-400" />
                    Packaging in progress
                  </p>
                  <p className="mt-1 text-[11px]">
                    Native AppImage and Flatpak distribution builds are being
                    finalized.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  disabled
                  variant="outline"
                  className="border-border/60 text-muted-foreground/60 h-11 w-full cursor-not-allowed justify-between rounded-lg px-4 text-xs font-medium"
                >
                  <span className="inline-flex items-center gap-2">
                    <Package className="size-4" />
                    Download x64 AppImage
                  </span>
                  <span className="font-mono text-[10px]">Coming Soon</span>
                </Button>
              </div>
            </div>

            {/* MACOS CARD (Coming Soon) */}
            <div className="border-border/70 bg-card/50 relative flex flex-col justify-between overflow-hidden rounded-lg border p-6 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FaApple className="text-foreground size-6" />
                    <h3 className="text-foreground text-lg font-semibold">
                      macOS
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    Em Breve
                  </span>
                </div>

                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                  Universal binary with native support for Apple Silicon (M1-M4)
                  and Intel hardware on macOS 13+.
                </p>

                {/* Info Note */}
                <div className="border-border/50 bg-muted/30 text-muted-foreground mt-6 rounded-lg border p-3 text-xs">
                  <p className="text-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 text-amber-400" />
                    Notarization & Testing
                  </p>
                  <p className="mt-1 text-[11px]">
                    Apple code-signing and universal DMG release pipeline is
                    underway.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  disabled
                  variant="outline"
                  className="border-border/60 text-muted-foreground/60 h-11 w-full cursor-not-allowed justify-between rounded-lg px-4 text-xs font-medium"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="size-4" />
                    Download Universal .dmg
                  </span>
                  <span className="font-mono text-[10px]">Coming Soon</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Self-Hosted & Docker Backend Section (max rounded-lg) */}
          <div className="border-border/80 bg-card/70 mt-14 overflow-hidden rounded-lg border p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <Server className="size-4 text-purple-400" />
                  <span>Self-Hosted & Enterprise</span>
                </div>
                <h2 className="text-foreground mt-2 text-xl font-normal tracking-tight sm:text-2xl">
                  Self-Hosted Sync Server
                </h2>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                  Run your own private replication backend for RxDB and
                  encrypted multi-device telemetry synchronization without
                  relying on third-party cloud servers.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                  <span className="border-border/70 bg-muted/50 text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]">
                    <ShieldCheck className="size-3.5 text-emerald-400" />
                    Zero Cloud Dependency
                  </span>
                  <span className="border-border/70 bg-muted/50 text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]">
                    <HardDrive className="size-3.5 text-blue-400" />
                    SQLite & PostgreSQL Support
                  </span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-10 shrink-0 gap-2 rounded-lg px-4 text-xs"
              >
                <Link href="/docs/sync-engine">
                  <Terminal className="size-3.5" />
                  View Server Docs
                  <ArrowUpRight className="size-3 opacity-60" />
                </Link>
              </Button>
            </div>

            {/* Docker Compose Code Block (max rounded-lg) */}
            <div className="border-border/80 relative mt-6 overflow-hidden rounded-lg border bg-[#090d16] p-4 font-mono text-xs shadow-inner">
              <div className="border-border/40 text-muted-foreground flex items-center justify-between border-b pb-2.5 text-[11px]">
                <span className="text-foreground/80 flex items-center gap-1.5">
                  <FileCode2 className="size-3.5 text-purple-400" />
                  docker-compose.yml
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dockerComposeYaml, 'docker')}
                  className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  {copiedDocker ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-[#c9d1d9]">
                <code>{dockerComposeYaml}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
