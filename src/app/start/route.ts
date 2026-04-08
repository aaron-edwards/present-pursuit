import { NextResponse } from "next/server";

import { getFirstStep, getHuntDestination } from "@/lib/hunt";
import {
  createInitialProgress,
  getCookieName,
  getProgressCookieValue,
} from "@/lib/progress";
import { getOriginFromHeaders } from "@/lib/site";

export async function GET(request: Request) {
  const origin = getOriginFromHeaders(request.headers);
  const response = NextResponse.redirect(
    new URL(getHuntDestination(getFirstStep().id), origin),
  );

  response.cookies.set({
    name: getCookieName(),
    value: getProgressCookieValue(createInitialProgress()),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
