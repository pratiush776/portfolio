"use client";

import * as React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
};

// React 19.2 / Next 16 ship `ViewTransition` (and historically `unstable_ViewTransition`)
// via the compiled React bundle. The local `react` typings (and some published builds)
// don't expose it, so we resolve at runtime with a safe fallback.
type ReactWithViewTransition = typeof React & {
  ViewTransition?: React.ComponentType<{ name?: string; children?: React.ReactNode }>;
  unstable_ViewTransition?: React.ComponentType<{ name?: string; children?: React.ReactNode }>;
};

const ReactNS = React as ReactWithViewTransition;
const Impl: React.ComponentType<{ name?: string; children?: React.ReactNode }> =
  ReactNS.ViewTransition ??
  ReactNS.unstable_ViewTransition ??
  (({ children }) => <>{children}</>);

export function HeroViewTransition({ name, children }: Props) {
  return <Impl name={name}>{children}</Impl>;
}
