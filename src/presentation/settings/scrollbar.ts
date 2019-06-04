export default class Scrollbar {
  public static scrollOps = {
    scrollPanel: {
      scrollingX: false,
      scrollingY: true,
      padding: true,
    },
    bar: {
      background: "#007bff", // TODO get this from somewhere else
      keepShow: true,
    },
    rail: {
      background: "#f8f9fa",
      opacity: 1,
    },
  };
}
