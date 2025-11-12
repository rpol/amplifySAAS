import { NextRequest } from "next/server";

import { auth } from "@amplify/auth";

const handler = (request: NextRequest) => auth.handler(request);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
