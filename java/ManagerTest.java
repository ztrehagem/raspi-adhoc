class ManagerTest {
  public static void main(String[] args) {
    String id;
    Manager manager = new Manager();
    id = manager.register("parent1", "child1", "abc");
    System.out.println(id);
    id = manager.register("parent2", "child2", "def");
    System.out.println(id);
    id = manager.find("parent1", "child1");
    System.out.println(id);
    id = manager.find("parent3", "child3");
    System.out.println(id);
  }
}
