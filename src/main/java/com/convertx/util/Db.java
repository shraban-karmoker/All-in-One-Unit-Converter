package com.convertx.util;

import java.sql.*;

/** JDBC connection factory. Override with env vars CX_DB_URL, CX_DB_USER, CX_DB_PASS. */
public final class Db {
    static { try { Class.forName("com.mysql.cj.jdbc.Driver"); } catch (Exception e) { throw new ExceptionInInitializerError(e); } }
    private Db() {}
    private static String env(String k, String d) { String v = System.getenv(k); return v == null ? d : v; }

    public static Connection get() throws SQLException {
        return DriverManager.getConnection(
            env("CX_DB_URL", "jdbc:mysql://localhost:3306/convertx?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"),
            env("CX_DB_USER", "convertx"), env("CX_DB_PASS", "convertx_pass"));
    }
}
