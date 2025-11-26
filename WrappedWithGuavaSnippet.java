// Custom wrapper class for testing Black Duck snippet detection
// This file intentionally contains open source code snippets for testing purposes

import java.util.Objects;

/**
 * Test class that wraps Guava string utilities for snippet detection testing.
 * This class is NOT intended for production use or compilation.
 */
public class WrappedWithGuavaSnippet {
    
    private static final String TEST_PREFIX = "BlackDuck_Test_";
    
    public WrappedWithGuavaSnippet() {
        // Custom initialization code
        System.out.println("Initializing snippet test wrapper");
    }
    
    // Custom method before the Guava snippet
    public String addTestPrefix(String input) {
        return TEST_PREFIX + (input != null ? input : "null");
    }

    // ============================================================================
    // BEGIN GUAVA SNIPPET - APACHE LICENSE 2.0
    // Source: https://github.com/google/guava/blob/master/guava/src/com/google/common/base/Strings.java
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
     * Returns the given string if it is nonempty; {@code null} otherwise.
     *
     * @param string the string to test and possibly return
     * @return {@code string} itself if it is nonempty; {@code null} if it is empty or null
     */
    public static String emptyToNull(String string) {
        return isNullOrEmpty(string) ? null : string;
    }

    /**
     * Returns {@code true} if the given string is null or is the empty string.
     *
     * <p>Consider normalizing your string references with {@link #nullToEmpty}. If you do, you can
     * use {@link String#isEmpty()} instead of this method, and you won't need special null-safe forms
     * of methods like {@link String#toUpperCase} either. Or, if you'd like to normalize "in the other
     * direction," converting empty strings to {@code null}, you can use {@link #emptyToNull}.
     *
     * @param string a string reference to check
     * @return {@code true} if the string is null or is the empty string
     */
    public static boolean isNullOrEmpty(String string) {
        return string == null || string.isEmpty();
    }

    /**
     * Returns a string, of length at least {@code minLength}, consisting of {@code string} prepended
     * with as many copies of {@code padChar} as are necessary to reach that length. For example,
     *
     * <ul>
     *   <li>{@code padStart("7", 3, '0')} returns {@code "007"}
     *   <li>{@code padStart("2010", 3, '0')} returns {@code "2010"}
     * </ul>
     *
     * <p>See {@link java.util.Formatter} for a richer set of formatting capabilities.
     *
     * @param string the string which should appear at the end of the result
     * @param minLength the minimum length the resulting string must have. Can be zero or negative, in
     *     which case the input string is always returned.
     * @param padChar the character to insert at the beginning of the result until the minimum length
     *     is reached
     * @return the padded string
     */
    public static String padStart(String string, int minLength, char padChar) {
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
     *
     * <ul>
     *   <li>{@code padEnd("4.", 5, '0')} returns {@code "4.000"}
     *   <li>{@code padEnd("2010", 3, '!')} returns {@code "2010"}
     * </ul>
     *
     * <p>See {@link java.util.Formatter} for a richer set of formatting capabilities.
     *
     * @param string the string which should appear at the beginning of the result
     * @param minLength the minimum length the resulting string must have. Can be zero or negative, in
     *     which case the input string is always returned.
     * @param padChar the character to append to the end of the result until the minimum length is
     *     reached
     * @return the padded string
     */
    public static String padEnd(String string, int minLength, char padChar) {
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
     * Returns a string consisting of a specific number of concatenated copies of an input string. For
     * example, {@code repeat("hey", 3)} returns the string {@code "heyheyhey"}.
     *
     * @param string any non-null string
     * @param count the number of times to repeat it; a nonnegative integer
     * @return a string containing {@code string} repeated {@code count} times (the empty string if
     *     {@code count} is zero)
     * @throws IllegalArgumentException if {@code count} is negative
     */
    public static String repeat(String string, int count) {
        if (count <= 1) {
            if (count < 0) {
                throw new IllegalArgumentException("invalid count: " + count);
            }
            return (count == 0) ? "" : string;
        }

        // IF YOU MODIFY THE CODE BELOW, you must update StringsRepeatBenchmark
        final int len = string.length();
        final long longSize = (long) len * (long) count;
        final int size = (int) longSize;
        if (size != longSize) {
            throw new ArrayIndexOutOfBoundsException("Required array size too large: " + longSize);
        }

        final char[] array = new char[size];
        string.getChars(0, len, array, 0);
        int n;
        for (n = len; n < size - n; n <<= 1) {
            System.arraycopy(array, 0, array, n, n);
        }
        System.arraycopy(array, 0, array, n, size - n);
        return new String(array);
    }

    // ============================================================================
    // END GUAVA SNIPPET
    // ============================================================================
    
    // Custom methods after the Guava snippet
    
    /**
     * Custom utility method that combines Guava functionality with test logic
     */
    public String processTestString(String input, int minLength) {
        String safe = nullToEmpty(input);
        String prefixed = addTestPrefix(safe);
        return padEnd(prefixed, minLength, '_');
    }
    
    /**
     * Test method to demonstrate usage
     */
    public void runTests() {
        System.out.println("Testing wrapped Guava utilities:");
        System.out.println("nullToEmpty(null): '" + nullToEmpty(null) + "'");
        System.out.println("emptyToNull(''): " + emptyToNull(""));
        System.out.println("isNullOrEmpty(null): " + isNullOrEmpty(null));
        System.out.println("padStart('7', 3, '0'): '" + padStart("7", 3, '0') + "'");
        System.out.println("padEnd('4.', 5, '0'): '" + padEnd("4.", 5, '0') + "'");
        System.out.println("repeat('hey', 3): '" + repeat("hey", 3) + "'");
        System.out.println("processTestString('test', 20): '" + processTestString("test", 20) + "'");
    }
    
    // Custom main method for testing
    public static void main(String[] args) {
        WrappedWithGuavaSnippet wrapper = new WrappedWithGuavaSnippet();
        wrapper.runTests();
    }
}