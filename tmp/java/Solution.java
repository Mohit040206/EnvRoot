
class Solution {

    public static Object solution(Object... args) {
        int[] arr = (int[]) args[0];

        java.util.Set<Integer> set = new java.util.LinkedHashSet<>();
        for (int n : arr) {
            set.add(n);
        }

        int[] result = new int[set.size()];
        int i = 0;
        for (int n : set) {
            result[i++] = n;
        }

        return java.util.Arrays.toString(result);
    }


public static void main(String[] args) throws Exception {
    java.io.BufferedReader br =
        new java.io.BufferedReader(new java.io.InputStreamReader(System.in));

    String input = br.readLine();
    String cleaned = input.replace("[", "").replace("]", "");
    String[] parts = cleaned.split(",");

    int[] arr = new int[parts.length];
    for (int i = 0; i < parts.length; i++) {
        arr[i] = Integer.parseInt(parts[i].trim());
    }

    Object result = solution(arr);
    System.out.println(result);
}
}
