package com.convertx.model;

/** One conversion: used for both history rows (value/result set) and favorites. */
public class Entry {
    public long id;
    public String category, from, to, value, result, created;

    public String json() {
        return "{\"id\":" + id + ",\"category\":" + q(category) + ",\"from\":" + q(from) + ",\"to\":" + q(to)
             + ",\"value\":" + q(value) + ",\"result\":" + q(result) + ",\"created\":" + q(created) + "}";
    }

    private static String q(String s) {
        if (s == null) return "null";
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else b.append(c < 32 ? ' ' : c);
        }
        return b.append('"').toString();
    }
}
