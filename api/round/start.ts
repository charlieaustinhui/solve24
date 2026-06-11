// Opens a round: returns a signed, single-use token the client submits with its
// score when the round ends. Pure CPU — no database. See src/lib/roundToken.ts.
import { signToken } from '../../src/lib/roundToken.js'

export function POST(): Response {
  try {
    return Response.json({ token: signToken() }, { status: 201 })
  } catch {
    // ROUND_TOKEN_SECRET missing — fail soft; the round still plays locally.
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
