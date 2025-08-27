import React, { Fragment } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

const PaginationAnn = ({ totalPages  , page , setPage}) => {
  return (
    <Fragment>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6 items-center">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormPreviousLink />
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormNextLink />
          </button>
        </div>
      )}
    </Fragment>
  );
};

export default PaginationAnn;
