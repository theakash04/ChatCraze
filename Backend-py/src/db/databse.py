import sqlite3
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from src.model.req_body_model import signUpModel
from datetime import datetime
from typing import Any, Tuple

load_dotenv()

DATABASE = os.environ["DATABASE"]


class DatabaseManager:
    def __init__(self):
        self.db_path = DATABASE

    def get_connection(self) -> sqlite3.Connection:
        try:
            conn = sqlite3.connect(self.db_path)
            return conn
        except sqlite3.Error as err:
            raise HTTPException(status_code=500, detail=f"Error connecting to database: {err}")

    def __execute_query(self, query: str, param: Tuple = (), fetch: bool = False, fetch_type: int = 1, update: bool = False) -> Any:
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

        except sqlite3.IntegrityError as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=409, detail=f"Integrity error: {err}")
        except sqlite3.ProgrammingError as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=400, detail=f"Programming error: {err}")
        except Exception as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=f"Database error occurred: {str(err)}")
        finally:
            cursor.close()
            conn.close()

    # initialize database with schema file
    def init_db(self):
        current_directory = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(current_directory, "schema.sql"), "r") as f:
            schema = f.read()
        for stmt in schema.split(";"):
            stmt = stmt.strip()
            if stmt:
                self.__execute_query(stmt)

    # insert or delete based on verification status
    def insert_user_data(self, user: signUpModel, otp: str, verified: bool) -> bool:
        if not verified:
            delete_query = "DELETE FROM users WHERE username = ? OR email = ?"
            self.__execute_query(delete_query, (user.username, user.email))
        else:
            insert_query = """
                INSERT INTO users (username, email, password, otp, createdAt)
                VALUES (?,?,?,?,?)
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

    # check and return the otp
    def verify_otp(self, username: str) -> dict[str, Any]:
        query = "SELECT otp, createdAt, email FROM users WHERE username = ?"
        result = self.__execute_query(query, (username,), fetch=True)
        if result:
            otp, createdAt, email = result
            return {"otp": otp, "createdAt": createdAt, "email": email}
        else:
            raise HTTPException(status_code=404, detail="User not found!")

    # set user as verified
    def verified_user(self, username: str) -> bool:
        update_query = "UPDATE users SET isVerified = ? WHERE username = ?"
        self.__execute_query(update_query, (True, username), fetch=True)
        return True

    # check if user exist or not
    def user_exists(self, username: str = None, email: str = None):
        if not (username or email):
            raise ValueError("At least one of username or email must be provided.")

        # Build the SQL query dynamically based on input
        conditions, parameters = [], []
        if username:
            conditions.append("username = ?")
            parameters.append(username)
        if email:
            conditions.append("email = ?")
            parameters.append(email)

        # Join conditions with OR if any condition exists
        query = "SELECT isVerified FROM users WHERE " + " OR ".join(conditions)
        return self.__execute_query(query, tuple(parameters), fetch=True)

    def getPass(self, username: str):
        query = "SELECT password FROM users WHERE username = ?"
        return self.__execute_query(query, (username,), fetch=True)

    def getAllUsers(self):
        query = "SELECT username, isOnline FROM users"
        data = self.__execute_query(query, fetch=True, fetch_type=3)
        users = [{"username": username, "isOnline": is_online} for username, is_online in data]
        return users

    def makeCustomQuery(self, query: str, param: Tuple, update=True):
        return self.__execute_query(query, param=param, fetch=True, update=update)


__all__ = ["DatabaseManager"]
