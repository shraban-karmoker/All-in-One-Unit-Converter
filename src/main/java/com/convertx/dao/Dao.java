package com.convertx.dao;

import com.convertx.model.Entry;
import com.convertx.util.Db;
import java.sql.*;
import java.util.*;

/** All SQL lives here (prepared statements only). */
public final class Dao {
    private Dao() {}

    public static List<Entry> history(String uid) throws SQLException {
        return rows("SELECT id,category,from_unit,to_unit,input_value,result_value,DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') "
                  + "FROM conversion_history WHERE user_id=? ORDER BY id DESC LIMIT 50", uid);
    }

    public static List<Entry> favorites(String uid) throws SQLException {
        return rows("SELECT id,category,from_unit,to_unit,NULL,NULL,NULL FROM favorites WHERE user_id=? ORDER BY id DESC", uid);
    }

    public static void addHistory(String uid, Entry e) throws SQLException {
        List<Entry> h = history(uid);
        if (!h.isEmpty()) {                       // skip exact repeat of the latest entry
            Entry l = h.get(0);
            if (l.category.equals(e.category) && l.from.equals(e.from) && l.to.equals(e.to)
                && l.value.equals(e.value) && l.result.equals(e.result)) return;
        }
        exec("INSERT INTO conversion_history(user_id,category,from_unit,to_unit,input_value,result_value) VALUES(?,?,?,?,?,?)",
             uid, e.category, e.from, e.to, e.value, e.result);
        exec("DELETE FROM conversion_history WHERE user_id=? AND id<=(SELECT id FROM "
           + "(SELECT id FROM conversion_history WHERE user_id=? ORDER BY id DESC LIMIT 1 OFFSET 200) x)", uid, uid); // cap at 200
    }

    public static void deleteHistory(String uid, Long id) throws SQLException {
        if (id == null) exec("DELETE FROM conversion_history WHERE user_id=?", uid);
        else exec("DELETE FROM conversion_history WHERE user_id=? AND id=?", uid, id);
    }

    public static void addFavorite(String uid, Entry e) throws SQLException {
        exec("INSERT IGNORE INTO favorites(user_id,category,from_unit,to_unit) VALUES(?,?,?,?)", uid, e.category, e.from, e.to);
    }

    public static void deleteFavorite(String uid, long id) throws SQLException {
        exec("DELETE FROM favorites WHERE user_id=? AND id=?", uid, id);
    }

    /** @return {theme, decimals}; defaults if the user has none saved. */
    public static String[] settings(String uid) throws SQLException {
        try (Connection c = Db.get(); PreparedStatement ps = c.prepareStatement("SELECT theme,decimals FROM user_settings WHERE user_id=?")) {
            ps.setString(1, uid);
            try (ResultSet r = ps.executeQuery()) { if (r.next()) return new String[]{r.getString(1), r.getString(2)}; }
        }
        return new String[]{"light", "6"};
    }

    public static void saveSettings(String uid, String theme, int decimals) throws SQLException {
        exec("INSERT INTO user_settings(user_id,theme,decimals) VALUES(?,?,?) ON DUPLICATE KEY UPDATE theme=VALUES(theme),decimals=VALUES(decimals)",
             uid, theme, decimals);
    }

    private static void exec(String sql, Object... p) throws SQLException {
        try (Connection c = Db.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            for (int i = 0; i < p.length; i++) ps.setObject(i + 1, p[i]);
            ps.executeUpdate();
        }
    }

    private static List<Entry> rows(String sql, String uid) throws SQLException {
        List<Entry> out = new ArrayList<>();
        try (Connection c = Db.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, uid);
            try (ResultSet r = ps.executeQuery()) {
                while (r.next()) {
                    Entry e = new Entry();
                    e.id = r.getLong(1); e.category = r.getString(2); e.from = r.getString(3); e.to = r.getString(4);
                    e.value = r.getString(5); e.result = r.getString(6); e.created = r.getString(7);
                    out.add(e);
                }
            }
        }
        return out;
    }
}
