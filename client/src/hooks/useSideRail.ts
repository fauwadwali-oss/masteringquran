import * as React from "react";

// iPhone Duo, folded (portrait) and unfolded (landscape): a status column down
// the right edge only. The main links move into that column as a rail. A
// notched iPhone in landscape has insets on both sides and keeps its layout.
export function useSideRail() {
  const [sideRail, setSideRail] = React.useState(false);

  React.useEffect(() => {
    // Zero-height probes as wide as each side inset. The insets can arrive after
    // first render and change on fold/unfold without a resize event, so watch them.
    const left = document.createElement("div");
    const right = document.createElement("div");
    left.style.cssText = "position:fixed;top:0;left:0;height:0;visibility:hidden;pointer-events:none;width:env(safe-area-inset-left)";
    right.style.cssText = "position:fixed;top:0;right:0;height:0;visibility:hidden;pointer-events:none;width:env(safe-area-inset-right)";
    document.body.append(left, right);
    const update = () => setSideRail(right.offsetWidth >= 44 && left.offsetWidth < 44);
    const observer = new ResizeObserver(update);
    observer.observe(left);
    observer.observe(right);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      left.remove();
      right.remove();
    };
  }, []);

  return sideRail;
}
