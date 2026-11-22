package com.convertx.controller;

import com.convertx.dao.Dao;
import com.convertx.model.Entry;
import com.convertx.util.Util;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** GET list, POST add, DELETE ?id=N. */
@WebServlet("/api/favorites")
public class FavoriteServlet extends HttpServlet {
    @Override protected void doGet(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        try { Util.json(rs, Util.list(Dao.favorites(Util.uid(rq, rs)))); } catch (Exception e) { Util.fail(rs, e); }
    }
    @Override protected void doPost(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        Entry e = Util.entry(rq);
        if (e == null) { rs.sendError(400); return; }
        try { Dao.addFavorite(Util.uid(rq, rs), e); Util.json(rs, "{\"ok\":true}"); } catch (Exception ex) { Util.fail(rs, ex); }
    }
    @Override protected void doDelete(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        try { Dao.deleteFavorite(Util.uid(rq, rs), Long.parseLong(rq.getParameter("id"))); Util.json(rs, "{\"ok\":true}"); }
        catch (NumberFormatException e) { rs.sendError(400); } catch (Exception e) { Util.fail(rs, e); }
    }
}
