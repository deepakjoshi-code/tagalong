export type TransportErrorCode =
  | 'unsupported'
  | 'cancelled'
  | 'not-found'
  | 'disconnected'
  | 'gatt'
  | 'bad-frame'
  | 'permission'

export class TransportError extends Error {
  readonly code: TransportErrorCode
  constructor(code: TransportErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'TransportError'
    this.code = code
  }
}

export const isTransportError = (e: unknown): e is TransportError => e instanceof TransportError

/** User-facing copy for transport failures. Never includes device identifiers. */
export function describeTransportError(e: unknown): string {
  if (!isTransportError(e)) return 'Something went wrong talking to the tag.'
  switch (e.code) {
    case 'unsupported':
      return 'This browser can’t use Bluetooth. Try Chrome on Android, or use Demo mode.'
    case 'cancelled':
      return 'No tag was chosen.'
    case 'not-found':
      return 'Couldn’t find that tag. Hold its button until it giggles, then try again.'
    case 'disconnected':
      return 'The tag disconnected. Bring it closer and try again.'
    case 'permission':
      return 'Bluetooth permission was denied. You can change this in your browser settings.'
    case 'gatt':
    case 'bad-frame':
    default:
      return 'The tag didn’t respond as expected. Try again in a moment.'
  }
}
