let tools = {
  underline: Underline,
  header: {
    class: Header,
    inlineToolbar: ["link"],
    config: {
      placeholder: "Enter a header",
      levels: [2, 3, 4],
      defaultLevel: 3,
      defaultAlignment: "left",
    },
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: "unordered",
    },
  },
  delimiter: {
    class: Delimiter,
  },
  alert: Alert,
  hyperlink: {
    class: Hyperlink,
    config: {
      shortcut: "CMD+L",
      target: "_blank",
      rel: "nofollow",
      availableTargets: ["_blank", "_self"],
      availableRels: ["author", "noreferrer"],
      validate: false,
    },
  },
  link: {
    class: LinkAutocomplete,
    config: {
      endpoint: "http://localhost:3000/",
      queryParam: "search",
    },
  },
  marker: {
    class: Marker,
    shortcut: "CMD+SHIFT+M",
  },
  changeCase: {
    class: ChangeCase,
    config: {
      showLocaleOption: true, // enable locale case options
      locale: "tr", // or ['tr', 'TR', 'tr-TR']
    },
  },
  tooltip: {
    class: Tooltip,
    config: {
      location: "left",
      highlightColor: "#FFEFD5",
      underline: true,
      backgroundColor: "#154360",
      textColor: "#FDFEFE",
      holder: "editorId",
    },
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
};

function initEditor(character) {
  const editor = new EditorJS({
    holder: "editorjs",
    tools,
    data: character.loreData,
  });
}

function save(editor) {
  return new Promise(async (resolve, reject) => {
    try {
      let outputData = await editor.save();

      console.log("Article data: ", outputData);
      resolve(outputData);

      // Don't forget to stringify outputData for Cookies
    } catch (error) {
      console.log("Saving failed: ", error);
    }
  });
}

async function getCharacter(name) {
  let response = await fetch(`${apiRoot}/characters/${name}`);
  let json = await response.json();
}
