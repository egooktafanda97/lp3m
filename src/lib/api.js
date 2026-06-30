export function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}
