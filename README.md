# ConvertX – All-in-One Unit Converter
HTML5 + CSS3 + JavaScript front end · Java Servlets/JSP (MVC) back end · MySQL · Apache Tomcat 10.1

## Structure
```
ConvertX/
├── database/schema.sql                      MySQL schema + app user
├── pom.xml                                  Maven build (WAR)
└── src/main
    ├── java/com/convertx
    │   ├── model/Entry.java                 Model
    │   ├── dao/Dao.java                     Data access (all SQL)
    │   ├── util/{Db,Util}.java              JDBC + helpers (anonymous user cookie)
    │   └── controller/                      Home, History, Favorite, Settings servlets
    └── webapp
        ├── WEB-INF/views/index.jsp          View
        └── assets/{css/style.css, js/units.js, js/app.js}
```

## Setup
1. Install JDK 17+, Maven 3.9+, MySQL 8+, Apache Tomcat 10.1+ (Tomcat 9: see comment in pom.xml).
2. Create the database:  `mysql -u root -p < database/schema.sql`
   (creates user `convertx` / `convertx_pass`; change it, then set env vars CX_DB_URL, CX_DB_USER, CX_DB_PASS before starting Tomcat).
3. Build:  `mvn clean package`  → `target/ConvertX.war`
4. Deploy: copy the WAR to `<TOMCAT_HOME>/webapps/`
5. Start:  `<TOMCAT_HOME>/bin/startup.sh` (Windows: `bin\startup.bat`)
6. Open:   http://localhost:8080/ConvertX/

Eclipse/IntelliJ: import as a Maven project, add a Tomcat 10.1 server, run on server.

## Notes
- Users are anonymous: a random id in an HttpOnly cookie (`cx_uid`) keys settings, history and favorites.
- Data units use 1024 steps; month/year use the Gregorian average; gallon/cup/pint are US.
- Negative values are accepted for Temperature (above absolute zero) and Angle only.
- If the server/DB is down, conversions still work; history/favorites show a notice.
