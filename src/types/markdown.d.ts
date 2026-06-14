declare module '*.md' {
  export const frontmatter: Record<string, unknown>;
  export const html: string;
  export const toc: { level: 2 | 3; id: string; text: string }[];
}
