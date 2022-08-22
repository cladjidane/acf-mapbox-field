import "./bounds.css"

import { iconBounds, iconMinus, iconPlus } from "../../utils/helpers";

/**
 * Simple get bounds
 */
export default class BoundsControl {
  insertControls() {
    this.container = document.createElement("div");
    this.container.classList.add("mapboxgl-ctrl");
    this.container.classList.add("mapboxgl-ctrl-group");
    this.container.classList.add("mapboxgl-ctrl-zoom");
    this.bounds = document.createElement("button");
    this.bounds.setAttribute("type", "button");
    this.bounds.appendChild(iconBounds());
    this.container.appendChild(this.bounds);
  }

  onAdd(map) {
    this.map = map;
    this.insertControls();

    this.bounds.addEventListener('click', () => {
      this.map.fire('bounds.get');
    });
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
