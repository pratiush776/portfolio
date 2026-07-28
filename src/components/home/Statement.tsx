/**
 * The promise, and nothing more: a compact bridge from identity to proof. Its top edge crosses the
 * hero fold, so it stays rendered at rest instead of using the shared positive-y reveal — hiding
 * the line until after a visitor scrolls would erase the cue it exists to provide.
 *
 * It shares the landing's centred chapter axis with the hero and PROJECTS. The physical gap below
 * is tightened to compensate for PROJECTS arriving from a mask, so the initially empty area
 * beneath the statement does not outweigh the space above it.
 */
export function Statement() {
  return (
    <div className="statement-bridge gutter measure">
      <p className="statement editorial">
        I turn rough ideas into polished products.
      </p>
    </div>
  );
}
