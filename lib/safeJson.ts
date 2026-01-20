/**
 * 安全なJSONパース関数
 * 
 * @param input - パースする文字列または既にパース済みのオブジェクト
 * @param defaultValue - パースに失敗した場合のデフォルト値（オプション）
 * @returns パースされたオブジェクト、またはデフォルト値
 * 
 * @example
 * const data = safeJsonParse('{"key": "value"}'); // { key: "value" }
 * const data2 = safeJsonParse('invalid json', {}); // {}
 * const data3 = safeJsonParse(alreadyParsedObject); // alreadyParsedObject (そのまま返す)
 */
export function safeJsonParse<T = any>(
  input: unknown,
  defaultValue?: T
): T {
  // 既にオブジェクトの場合はそのまま返す
  if (typeof input !== "string") {
    return input as T;
  }

  // 空文字列の場合はデフォルト値または空オブジェクトを返す
  if (!input.trim()) {
    return (defaultValue ?? {} as T) as T;
  }

  try {
    // JSON.parse は第2引数なしで呼び出す（reviver 関数は使わない）
    const parsed = JSON.parse(input);
    return parsed as T;
  } catch (error) {
    console.error("JSON parse error:", error, "Input:", input);
    // デフォルト値が指定されている場合はそれを返す
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // デフォルト値がない場合は空オブジェクトを返す
    return {} as T;
  }
}

/**
 * JSON文字列をパースし、失敗時はnullを返す
 * 
 * @param input - パースする文字列
 * @returns パースされたオブジェクト、またはnull
 */
export function safeJsonParseOrNull<T = any>(input: unknown): T | null {
  if (typeof input !== "string") {
    return input as T | null;
  }

  if (!input.trim()) {
    return null;
  }

  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

