from _decimal import Decimal

from pymysql.cursors import DictCursor


# Override dict cursor as mongodb, json does not support Decimal
class CustomDictCursor(DictCursor):

    def _do_get_result(self):
        # noinspection PyUnresolvedReferences,PyProtectedMember
        super()._do_get_result()
        # noinspection PyUnresolvedReferences
        for row in self._rows:
            for key, value in row.items():
                if isinstance(value, Decimal):
                    row[key] = float(value)
