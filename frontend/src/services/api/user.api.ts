// user.api.ts is kept for backward compatibility.
// New code should use staff.api.ts for /staffs and reader.api.ts for /readers.
export { staffApi } from './staff.api';
export type { Staff } from './staff.api';
export { readerApi } from './reader.api';
export type { Reader } from './reader.api';
