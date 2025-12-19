import { NextResponse } from "next/server";

// Updated interface to reflect backend expectations
interface RequestBody {
  question: string;
  answer: string;
  flag: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const backendStreamUrl = `${process.env["NEXT_PUBLIC_INTERNAL_DNS_URL"]}/cv/v1/assessment-helper`;

  // Check if backend URL is configured
  if (!process.env["NEXT_PUBLIC_INTERNAL_DNS_URL"]) {
    return new NextResponse(
      JSON.stringify({ error: "Backend URL is not configured" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  // Validate access token
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return new NextResponse(
      JSON.stringify({ error: "Access token is not provided" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  try {
    // Parse request body
    const bodyText = await req.text();
    let body: RequestBody;
    try {
      body = JSON.parse(bodyText);
      if (!body.question) {
        throw new Error("user_query is required");
      }

      if (!body.flag) {
        throw new Error("flag is required");
      }
    } catch (e) {
      return new NextResponse(
        JSON.stringify({
          error:
            e instanceof Error ? e.message : "Invalid JSON in request body",
        } as ErrorResponse),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const response = await fetch(backendStreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: JSON.stringify({
        question: body.question,
        answer: body.answer ?? "",
        flag: body.flag,
      }),
      cache: "no-store" as RequestCache,
    });

    // Handle backend errors
    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(
        JSON.stringify({
          error: `Backend error: ${response.status}`,
          details: errorText,
        } as ErrorResponse),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    if (!response.body) {
      throw new Error("No response body received from backend");
    }

    // Use TransformStream for debugging and passthrough
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
         new TextDecoder().decode(chunk);

        controller.enqueue(chunk);
      },
      flush(controller) {
        controller.terminate();
      },
    });

    // Pipe the backend response to the writable stream
    response.body.pipeTo(writable);

    // Return the readable stream with SSE headers
    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-Accel-Buffering": "no", // Prevent proxy buffering
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      } as ErrorResponse),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

export  function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
