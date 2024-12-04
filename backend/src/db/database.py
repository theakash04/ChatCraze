import os
from dotenv import load_dotenv
from fastapi import HTTPException
from src.model.req_body_model import signUpModel
from datetime import datetime
from typing import Any, Tuple
import psycopg
from psycopg.rows import dict_row

load_dotenv()

conn_params = {
    "host": os.environ["DB_HOST"],
    "dbname": os.environ["DB_NAME"],
    "user": os.environ["DB_USER"],
    "password": os.environ["DB_PASS"],
    "port": os.environ["DB_PORT"],
}

class DatabaseManager:

    def get_connection(self):
        """Establish a connection to the PostgreSQL database."""
        try:
            conn = psycopg.connect(**conn_params, row_factory=dict_row)
            return conn
        except psycopg.Error as err:
            raise HTTPException(
                status_code=500, detail=f"Error connecting to database: {err}"
            )

    def __execute_query(self,
                        query: str,
                        param: Tuple = (),
                        fetch: bool = False,
                        fetch_type: int = 1,
                        update: bool = False
                        ) -> Any:
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, param)
            conn.commit()

            if update:
                return cursor.rowcount
            if fetch:
                if fetch_type == 1:
                    return cursor.fetchone()
                elif fetch_type == 2:
                    return cursor.fetchmany()
                else:
                    return cursor.fetchall()

        except psycopg.IntegrityError as err:
            if conn:
                conn.rollback()
            raise HTTPException(
                status_code=409, detail=f"Integrity error: {err}")
        except psycopg.ProgrammingError as err:
            if conn:
                conn.rollback()
            raise HTTPException(
                status_code=400, detail=f"Programming error: {err}")
        except Exception as err:
            if conn:
                conn.rollback()
            raise HTTPException(
                status_code=500, detail=f"Database error occurred: {str(err)}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def init_db(self):
        """Initialize the database with the schema file."""
        current_directory = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(current_directory, "schema.sql"), "r") as f:
            schema = f.read()
        for stmt in schema.split(";"):
            stmt = stmt.strip()
            if stmt:
                self.__execute_query(stmt)

    def insert_user_data(self, user: signUpModel, otp: str, verified: bool) -> bool:
        """Insert or delete based on verification status."""
        if not verified:
            delete_query = "DELETE FROM users WHERE username = %s OR email = %s"
            self.__execute_query(delete_query, (user.username, user.email))
        else:
            insert_query = """
                INSERT INTO users (username, email, password, otp, createdat)
                VALUES (%s, %s, %s, %s, %s)
            """
            self.__execute_query(
                insert_query,
                (
                    user.username,
                    user.email,
                    user.password,
                    otp,
                    datetime.now(),
                ),
            )
        return True

    def verify_otp(self, username: str) -> dict[str, Any]:
        """Check and return the OTP for the given username."""
        query = "SELECT otp, createdat, email FROM users WHERE username = %s"
        result = self.__execute_query(query, (username,), fetch=True)
        if result:
            return result  # Return the first result as a dictionary (RealDictCursor)
        else:
            raise HTTPException(status_code=404, detail="User not found!")

    def verified_user(self, username: str) -> bool:
        """Set the user as verified."""
        update_query = "UPDATE users SET isverified = %s WHERE username = %s"
        self.__execute_query(update_query, (True, username))
        return True

    def user_exists(self, username: str = None, email: str = None):
        """Check if a user exists based on username or email."""
        if not (username or email):
            raise ValueError("At least one of username or email must be provided.")

        conditions, parameters = [], []
        if username:
            conditions.append("username = %s")
            parameters.append(username)
        if email:
            conditions.append("email = %s")
            parameters.append(email)

        query = "SELECT isverified FROM users WHERE " + " OR ".join(conditions)
        return self.__execute_query(query, tuple(parameters), fetch=True)

    def getPass(self, username: str):
        """Get the password for the given username."""
        query = "SELECT password FROM users WHERE username = %s"
        result = self.__execute_query(query, (username,), fetch=True)
        return result['password'] if result else None

    def getAllUsers(self):
        """Get all users."""
        query = "SELECT username, isonline FROM users"
        data = self.__execute_query(query, fetch=True, fetch_type=3)
        return [{"username": row["username"], "isOnline": row["isonline"]} for row in data]

    def makeCustomQuery(self, query: str, param: Tuple, update=True):
        """Execute custom SQL queries."""
        return self.__execute_query(query, param=param, fetch=True, update=update)

__all__ = ["DatabaseManager"]
