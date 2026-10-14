import { subscribe, toPublicMessage } from "/app/api/_chat-store.ts";
import { getOnlineUsers, subscribePresence } from "/app/api/_presence-store.ts";
import { isAdminRequest } from "/app/api/_admin-auth.ts";
export const dynamic = "force-dynamic";
export async function GET() {
	const encoder = new TextEncoder();
	let close;
	const stream = new ReadableStream({
		start(controller) {
			const send = (event) => {
				try {
					if (event.type === "unban-request" && !isAdminRequest(request)) return;
					if (event.type === "message") {
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(toPublicMessage(event.message))}\n\n`));
					} else {
						controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
					}
				} catch {
					close?.();
				}
			};
			controller.enqueue(encoder.encode(": connected\n\n"));
			const unsubscribe = subscribe(send);
			const unsubscribePresence = subscribePresence(() => {
				try {
					controller.enqueue(encoder.encode(`event: presence\ndata: ${JSON.stringify({ users: getOnlineUsers(isAdminRequest(request)) })}\n\n`));
				} catch {
					close?.();
				}
			});
			const heartbeat = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(": heartbeat\n\n"));
				} catch {
					close?.();
				}
			}, 15e3);
			close = () => {
				clearInterval(heartbeat);
				unsubscribe();
				unsubscribePresence();
				try {
					controller.close();
				} catch {}
			};
		},
		cancel() {
			close?.();
		}
	});
	return new Response(stream, { headers: {
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
		"Content-Type": "text/event-stream; charset=utf-8"
	} });
}

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsU0FBUyxXQUFXLHVCQUF1QjtBQUMzQyxTQUFTLGdCQUFnQix5QkFBeUI7QUFDbEQsU0FBUyxzQkFBc0I7QUFFL0IsT0FBTyxNQUFNLFVBQVU7QUFFdkIsT0FBTyxlQUFlLE1BQU07Q0FDMUIsTUFBTSxVQUFVLElBQUksWUFBWTtDQUNoQyxJQUFJO0NBRUosTUFBTSxTQUFTLElBQUksZUFBZTtFQUNoQyxNQUFNLFlBQVk7R0FDaEIsTUFBTSxRQUFRLFVBQTBEO0lBQ3RFLElBQUk7S0FDRixJQUFJLE1BQU0sU0FBUyxtQkFBbUIsQ0FBQyxlQUFlLE9BQU8sR0FBRztLQUNoRSxJQUFJLE1BQU0sU0FBUyxXQUFXO01BQzVCLFdBQVcsUUFBUSxRQUFRLE9BQU8sU0FBUyxLQUFLLFVBQVUsZ0JBQWdCLE1BQU0sT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDO0tBQ2xHLE9BQU87TUFDTCxXQUFXLFFBQVEsUUFBUSxPQUFPLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxVQUFVLEtBQUssRUFBRSxLQUFLLENBQUM7S0FDL0Y7SUFDRixRQUFRO0tBQ04sUUFBUTtJQUNWO0dBQ0Y7R0FFQSxXQUFXLFFBQVEsUUFBUSxPQUFPLGlCQUFpQixDQUFDO0dBQ3BELE1BQU0sY0FBYyxVQUFVLElBQUk7R0FDbEMsTUFBTSxzQkFBc0Isd0JBQXdCO0lBQ2xELElBQUk7S0FDRixXQUFXLFFBQVEsUUFBUSxPQUFPLDBCQUEwQixLQUFLLFVBQVUsRUFBRSxPQUFPLGVBQWUsZUFBZSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO0lBQ3ZJLFFBQVE7S0FDTixRQUFRO0lBQ1Y7R0FDRixDQUFDO0dBQ0QsTUFBTSxZQUFZLGtCQUFrQjtJQUNsQyxJQUFJO0tBQ0YsV0FBVyxRQUFRLFFBQVEsT0FBTyxpQkFBaUIsQ0FBQztJQUN0RCxRQUFRO0tBQ04sUUFBUTtJQUNWO0dBQ0YsR0FBRyxJQUFLO0dBQ1IsY0FBYztJQUNaLGNBQWMsU0FBUztJQUN2QixZQUFZO0lBQ1osb0JBQW9CO0lBQ3BCLElBQUk7S0FBRSxXQUFXLE1BQU07SUFBRyxRQUFRLENBQXVCO0dBQzNEO0VBQ0Y7RUFDQSxTQUFTO0dBQUUsUUFBUTtFQUFHO0NBQ3hCLENBQUM7Q0FFRCxPQUFPLElBQUksU0FBUyxRQUFRLEVBQzFCLFNBQVM7RUFDUCxpQkFBaUI7RUFDakIsWUFBWTtFQUNaLGdCQUFnQjtDQUNsQixFQUNGLENBQUM7QUFDSCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJyb3V0ZS50cyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzdWJzY3JpYmUsIHRvUHVibGljTWVzc2FnZSB9IGZyb20gXCIuLi9fY2hhdC1zdG9yZVwiO1xuaW1wb3J0IHsgZ2V0T25saW5lVXNlcnMsIHN1YnNjcmliZVByZXNlbmNlIH0gZnJvbSBcIi4uL19wcmVzZW5jZS1zdG9yZVwiO1xuaW1wb3J0IHsgaXNBZG1pblJlcXVlc3QgfSBmcm9tIFwiLi4vX2FkbWluLWF1dGhcIjtcblxuZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSBcImZvcmNlLWR5bmFtaWNcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICBsZXQgY2xvc2U6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuICBjb25zdCBzdHJlYW0gPSBuZXcgUmVhZGFibGVTdHJlYW0oe1xuICAgIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnN0IHNlbmQgPSAoZXZlbnQ6IFBhcmFtZXRlcnM8UGFyYW1ldGVyczx0eXBlb2Ygc3Vic2NyaWJlPlswXT5bMF0pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJ1bmJhbi1yZXF1ZXN0XCIgJiYgIWlzQWRtaW5SZXF1ZXN0KHJlcXVlc3QpKSByZXR1cm47XG4gICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUoYGRhdGE6ICR7SlNPTi5zdHJpbmdpZnkodG9QdWJsaWNNZXNzYWdlKGV2ZW50Lm1lc3NhZ2UpKX1cXG5cXG5gKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShgZXZlbnQ6ICR7ZXZlbnQudHlwZX1cXG5kYXRhOiAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX1cXG5cXG5gKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBjbG9zZT8uKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShcIjogY29ubmVjdGVkXFxuXFxuXCIpKTtcbiAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gc3Vic2NyaWJlKHNlbmQpO1xuICAgICAgY29uc3QgdW5zdWJzY3JpYmVQcmVzZW5jZSA9IHN1YnNjcmliZVByZXNlbmNlKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUoYGV2ZW50OiBwcmVzZW5jZVxcbmRhdGE6ICR7SlNPTi5zdHJpbmdpZnkoeyB1c2VyczogZ2V0T25saW5lVXNlcnMoaXNBZG1pblJlcXVlc3QocmVxdWVzdCkpIH0pfVxcblxcbmApKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgY2xvc2U/LigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGhlYXJ0YmVhdCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUoXCI6IGhlYXJ0YmVhdFxcblxcblwiKSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGNsb3NlPy4oKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTUwMDApO1xuICAgICAgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhcnRiZWF0KTtcbiAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdW5zdWJzY3JpYmVQcmVzZW5jZSgpO1xuICAgICAgICB0cnkgeyBjb250cm9sbGVyLmNsb3NlKCk7IH0gY2F0Y2ggeyAvKiBhbHJlYWR5IGNsb3NlZCAqLyB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgY2FuY2VsKCkgeyBjbG9zZT8uKCk7IH0sXG4gIH0pO1xuXG4gIHJldHVybiBuZXcgUmVzcG9uc2Uoc3RyZWFtLCB7XG4gICAgaGVhZGVyczoge1xuICAgICAgXCJDYWNoZS1Db250cm9sXCI6IFwibm8tY2FjaGUsIG5vLXRyYW5zZm9ybVwiLFxuICAgICAgQ29ubmVjdGlvbjogXCJrZWVwLWFsaXZlXCIsXG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvZXZlbnQtc3RyZWFtOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgfSxcbiAgfSk7XG59XG4iXX0=