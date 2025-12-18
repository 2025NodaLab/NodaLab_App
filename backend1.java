import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class backend1 {

    private static final String SUPABASE_URL =
        "https://uuqylozpigroitzafyqf.supabase.co/rest/v1/book";

    private static final String API_KEY =
        "sb_publishable_WIUHaQ9CxUissF-bgB-B6A_u3LHdGho";

    public static void main(String[] args) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SUPABASE_URL + "?select=*"))
                .header("apikey", API_KEY)
                .header("Authorization", "Bearer " + API_KEY)
                .GET()
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
