type PaperTextureProps = {
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
};

export function PaperTexture({
  opacity = 0.5,
  blendMode = "multiply",
}: PaperTextureProps) {
  return (
    <div
      className="paper-texture-v3"
      style={{
        opacity,
        mixBlendMode: blendMode,
        backgroundImage: 'url("/textures/paper-304L.png")',
      }}
      aria-hidden
    />
  );
}
