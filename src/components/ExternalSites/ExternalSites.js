export default function ExternalSites({ person, organization }) {

    const changeNameOrder = (name) => {
        // Split the name by the comma
        const nameArray = name.split(", ");
        
        // Reorder the name
        const reorderedName = nameArray[1] + " " + nameArray[0];
    
        // Replace umlauts and join with hyphens
        return reorderedName
            .normalize("NFD") // Normalize to split diacritical marks
            .replace(/[\u0308]/g, "e") // Replace umlaut by 'e'
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .split(" ")
            .join("-")
            .toLowerCase();
    };
    
    
    return (
      <div>
        <br />
        <h3>Search on other sites</h3>
        <ul>
          <li>
            <a
              href={`https://www.northdata.de/${encodeURIComponent(person.name)},${encodeURIComponent(person.residence)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              northdata
            </a>
          </li>
          <li>
            <a
              href={`https://www.abgeordnetenwatch.de/profile?politician_search_keys=${encodeURIComponent(person.name)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              abgeordnetenwatch
            </a>
          </li>
          <li>
            <a
                href={`https://afd-verbot.de/personen/${encodeURIComponent(changeNameOrder(person.name))}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                afd-verbot
            </a>
          </li>
          <li>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(person.name)}+${encodeURIComponent(organization)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              google.com search
            </a>
          </li>
          <li>
            <a
              href={`https://yandex.ru/search/?text=${encodeURIComponent(person.name)}+${encodeURIComponent(organization)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              yandex.ru search
            </a>
          </li>
          <li>
            <a
              href={`https://www.bing.com/search?q=${encodeURIComponent(person.name)}+${encodeURIComponent(organization)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              bing.com search
            </a>
          </li>
        </ul>
      </div>
    );
  }
  