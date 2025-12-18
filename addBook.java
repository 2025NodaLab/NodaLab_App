import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class addBook {

    private static final String SUPABASE_URL =
        "https://uuqylozpigroitzafyqf.supabase.co/rest/v1/book";

    private static final String API_KEY =
        "sb_publishable_WIUHaQ9CxUissF-bgB-B6A_u3LHdGho";

    public static void main(String[] args) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            // INSERTするJSON
            String json = """
                {
                  "id": 1000000,
                  "title": "テスト",
                  "author": "テスト",
                  "genre": "テスト",
                  "state": 0
                }
                """;

            System.out.println("入出json:");
            System.out.println(json);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SUPABASE_URL))
                .header("apikey", API_KEY)
                .header("Authorization", "Bearer " + API_KEY)
                .header("Content-Type", "application/json")
                // 追加した行を返す
                .header("Prefer", "return=representation")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

            HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("HTTP Status: " + response.statusCode());
            System.out.println("Response Body:");
            System.out.println(response.body());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
