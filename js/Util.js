const SPACE = new RegExp(' ', 'g');

export function getFile(option) {
  let file = "images/" + option.name.toLowerCase().replace(SPACE, "-");
  if (option.uses > 0) {
      file += option.uses;
  }
  return file + ".svg";
}

