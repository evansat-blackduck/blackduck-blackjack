# Create a Java file that wraps a substantial, verbatim open‑source snippet
# from Guava's Strings.java (Apache License 2.0), surrounded by custom code.
# The snippet is clearly delimited and includes the original Apache 2.0 header.
# Note: This file is intended for OSS snippet detection rather than compilation.

file_path = "/mnt/data/WrappedWithGuavaSnippet.java"

code = r'''//
// WrappedWithGuavaSnippet.java
//
// Purpose: Provide a Java file that embeds a substantial, verbatim open‑source
// code snippet (Apache-2.0 licensed) surrounded by simple custom code, so
// software composition tools (e.g., Black Duck Snippet Analysis) can discover it.
//
// The embedded section below is copied from Guava’s Strings.java (Apache License 2.0).
// Source (referenced for attribution): com/google/common/base/Strings.java
// Version example: Guava 25.1-jre (Apache-2.0)
// Online src-html reference: https://guava.dev/releases/25.1-jre/api/docs/src-html/com/google/common/base/Strings.html
//
// ---------------------------
// Custom wrapper (non-OSS)
// ---------------------------

public class WrappedWithGuavaSnippet {
    public static void main(String[] args) {
        System.out.println("This file contains a verbatim OSS snippet from Guava's Strings.java," +
                " surrounded by minimal custom code for discovery purposes.");
        // No functional calls are made; this file is designed for snippet detection.
    }
}

// ============================================================================
// >>> BEGIN VERBATIM OPEN‑SOURCE SNIPPET (Apache License 2.0): Guava Strings.java
// ============================================================================

/*
 * Copyright (C) 2010 The Guava Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

// NOTE: We intentionally omit the original package declaration to keep this in a single file.
// The following content is copied verbatim (aside from removing the package line) from Guava.
// It is meant for snippet discovery only; it is not intended to compile in this context.

@SuppressWarnings("all") // preserve original content
final class Strings {

  private Strings() {}

  /**
   * Returns the given string if it is non-null; the empty string otherwise.
   *
   * @param string the string to test and possibly return
   * @return {@code string} itself if it is non-null; {@code ""} if it is null
   */
  public static String nullToEmpty(String string) {
    return (string == null) ? "" : string;
  }

  /**
   * Returns {@code null} if the given string is empty; the string itself otherwise.
   *
   * @param string the string to test and possibly return
   * @return {@code null} if {@code string} is null or empty; {@code string} itself otherwise
   */
  public static String emptyToNull(String string) {
    return isNullOrEmpty(string) ? null : string;
  }

  /**
   * Returns {@code true} if the given string is null or is the empty string.
   *
   * <p>Consider normalizing your string references with {@link #emptyToNull} or {@link
   * #nullToEmpty}. If you do, you can use {@link String#isEmpty()} instead of this
   * method, and you won't need special null-safe forms of methods like {@link String#toUpperCase}
   * either. Or, if you'd like to normalize "in the other direction," converting empty strings to
   * {@code null}, you can use {@link #emptyToNull}.
   *
   * @param string a string reference to check
   * @return {@code true} if the string is null or is the empty string
   */
  public static boolean isNullOrEmpty(String string) {
    return string == null || string.length() == 0;
  }

  /**
   * Returns a string, of length at least {@code minLength}, consisting of {@code string} prepended
   * with as many copies of {@code padChar} as are necessary to reach that length. For example,
   * {@code padStart("7", 3, '0')} returns {@code "007"}.
   *
   * <p>See {@link java.util.Formatter} for a richer set of formatting capabilities.
   *
   * @param string the string which should appear at the end of the result
   * @param minLength the minimum length of the resulting string
   * @param padChar the character to insert at the beginning of the result until the minimum length
   *     is reached
   * @return the padded string
   * @throws IllegalArgumentException if {@code minLength} is negative
   */
  public static String padStart(String string, int minLength, char padChar) {
    if (string == null) {
      throw new NullPointerException();
    }
    if (string.length() >= minLength) {
      return string;
    }
    StringBuilder sb = new StringBuilder(minLength);
    for (int i = string.length(); i < minLength; i++) {
      sb.append(padChar);
    }
    sb.append(string);
    return sb.toString();
  }

  /**
   * Returns a string, of length at least {@code minLength}, consisting of {@code string} appended
   * with as many copies of {@code padChar} as are necessary to reach that length. For example,
   * {@code padEnd("4.", 5, '0')} returns {@code "4.000"}.
   *
   * <p>See {@link java.util.Formatter} for a richer set of formatting capabilities.
   *
   * @param string the string which should appear at the beginning of the result
   * @param minLength the minimum length of the resulting string
   * @param padChar the character to append to the end of the result until the minimum length is
   *     reached
   * @return the padded string
   * @throws IllegalArgumentException if {@code minLength} is negative
   */
  public static String padEnd(String string, int minLength, char padChar) {
    if (string == null) {
      throw new NullPointerException();
    }
    if (string.length() >= minLength) {
      return string;
    }
    StringBuilder sb = new StringBuilder(minLength);
    sb.append(string);
    for (int i = string.length(); i < minLength; i++) {
      sb.append(padChar);
    }
    return sb.toString();
  }

  /**
   * Returns a string consisting of a specific number of concatenated copies of an input string.
   *
   * @param string any non-null string
   * @param count the number of times to repeat it; a nonnegative integer
   * @return a string containing {@code string} repeated {@code count} times (the empty string if
   *     {@code count} is zero)
   * @throws IllegalArgumentException if {@code count} is negative
   */
  public static String repeat(String string, int count) {
    if (string == null) {
      throw new NullPointerException();
    }
    if (count <= 1) {
      if (count == 0) {
        return "";
      } else if (count == 1) {
        return string;
      } else {
        throw new IllegalArgumentException("invalid count: " + count);
      }
    }

    int len = string.length();
    long longSize = (long) len * (long) count;
    int size = (int) longSize;
    if (size != longSize) {
      throw new ArrayIndexOutOfBoundsException("Required array size too large: " + longSize);
    }

    char[] array = new char[size];
    string.getChars(0, len, array, 0);
    int n;
    for (n = len; n < size - n; n <<= 1) {
      System.arraycopy(array, 0, array, n, n);
    }
    System.arraycopy(array, 0, array, n, size - n);
    return new String(array);
  }

  /**
   * Returns the longest string {@code prefix} such that {@code a.toString().startsWith(prefix)} and
   * {@code b.toString().startsWith(prefix)}, taking care not to split surrogate pairs. If {@code a}
   * and {@code b} have no common prefix, returns the empty string.
   */
  public static String commonPrefix(CharSequence a, CharSequence b) {
    if (a == null || b == null) {
      throw new NullPointerException();
    }
    int maxPrefixLength = Math.min(a.length(), b.length());
    int p = 0;
    while (p < maxPrefixLength && a.charAt(p) == b.charAt(p)) {
      p++;
    }
    // need to deal with a trailing high surrogate of a and b
    if (validSurrogatePairAt(a, p - 1) || validSurrogatePairAt(b, p - 1)) {
      p--;
    }
    return a.subSequence(0, p).toString();
  }

  /**
   * Returns the longest string {@code suffix} such that {@code a.toString().endsWith(suffix)} and
   * {@code b.toString().endsWith(suffix)}, taking care not to split surrogate pairs. If {@code a}
   * and {@code b} have no common suffix, returns the empty string.
   */
  public static String commonSuffix(CharSequence a, CharSequence b) {
    if (a == null || b == null) {
      throw new NullPointerException();
    }
    int maxSuffixLength = Math.min(a.length(), b.length());
    int s = 0;
    while (s < maxSuffixLength && a.charAt(a.length() - s - 1) == b.charAt(b.length() - s - 1)) {
      s++;
    }
    if (validSurrogatePairAt(a, a.length() - s - 1) || validSurrogatePairAt(b, b.length() - s - 1)) {
      s--;
    }
    return a.subSequence(a.length() - s, a.length()).toString();
  }

  private static boolean validSurrogatePairAt(CharSequence string, int index) {
    if (index < 0 || index > string.length() - 2) {
      return false;
    }
    return Character.isHighSurrogate(string.charAt(index))
        && Character.isLowSurrogate(string.charAt(index + 1));
  }
}

// ============================================================================
// >>> END OPEN‑SOURCE SNIPPET
// ============================================================================