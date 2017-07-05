import java.util.HashMap;
import java.util.UUID;

class Manager {

  HashMap<String, Information> map = new HashMap<String, Information>();

  // input a new information from parent
  // <return> information ID
  public String register(String parentName, String childName, String appearance) {
    String id = UUID.randomUUID().toString();
    Information info = new Information(parentName, childName, appearance);
    map.put(id, info);
    return id;
  }

  // <return> null => not found
  //          not null => information ID
  public String find(String parentName, String childName) {
    for (String id : map.keySet()) {
      Information info = map.get(id);
      if (info.parentName.equals(parentName) && info.childName.equals(childName)) {
        return id;
      }
    }
    return null;
  }
}
