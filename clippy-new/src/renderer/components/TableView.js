"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WindowContext_1 = require("../contexts/WindowContext");
const TableView = ({ columns, data, onRowSelect, style, initialSelectedIndex, }) => {
    const [selectedRowIndex, setSelectedRowIndex] = (0, react_1.useState)(initialSelectedIndex ?? null);
    const [columnWidths, setColumnWidths] = (0, react_1.useState)({});
    const [resizing, setResizing] = (0, react_1.useState)(null);
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const tableRef = (0, react_1.useRef)(null);
    const { currentWindow } = (0, WindowContext_1.useWindow)();
    const sortedData = (0, react_1.useMemo)(() => {
        const dataCopy = [...data];
        if (sortConfig !== null) {
            dataCopy.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue)
                    return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue)
                    return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return dataCopy;
    }, [data, sortConfig]);
    const indexMap = (0, react_1.useMemo)(() => {
        return new Map(data.map((row, index) => [row, index]));
    }, [data]);
    const handleRowSelect = (0, react_1.useCallback)((sortedDataIndex) => {
        if (onRowSelect) {
            onRowSelect(indexMap.get(sortedData[sortedDataIndex]));
        }
        setSelectedRowIndex(sortedDataIndex);
    }, [onRowSelect, indexMap]);
    const handleSort = (columnKey) => {
        setSortConfig((currentSort) => ({
            key: columnKey,
            direction: currentSort?.key === columnKey && currentSort?.direction === "asc"
                ? "desc"
                : "asc",
        }));
    };
    const handleKeyDown = (e) => {
        if (!sortedData.length)
            return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (selectedRowIndex === null) {
                    // Select first row if nothing is selected
                    handleRowSelect(0);
                }
                else if (selectedRowIndex < sortedData.length - 1) {
                    // Move to next row
                    handleRowSelect(selectedRowIndex + 1);
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (selectedRowIndex === null) {
                    // Select last row if nothing is selected
                    handleRowSelect(sortedData.length - 1);
                }
                else if (selectedRowIndex > 0) {
                    // Move to previous row
                    handleRowSelect(selectedRowIndex - 1);
                }
                break;
            case "Escape":
                // Clear selection
                setSelectedRowIndex(null);
                break;
        }
    };
    (0, react_1.useEffect)(() => {
        // Focus the table container to enable keyboard navigation
        if (tableRef.current) {
            tableRef.current.focus();
        }
        // Add event listener for keyboard navigation
        currentWindow.addEventListener("keydown", handleKeyDown);
        // Cleanup
        return () => {
            currentWindow.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedRowIndex, sortedData]);
    const handleResizeStart = (e, columnKey) => {
        e.preventDefault();
        const resizeHandle = e.currentTarget;
        const handleRect = resizeHandle.getBoundingClientRect();
        const cursorOffset = e.clientX - handleRect.left;
        setResizing({
            key: columnKey,
            startX: e.clientX,
            initialWidth: columnWidths[columnKey] || 50,
            cursorOffset,
        });
    };
    const handleResizeMove = (e) => {
        if (!resizing)
            return;
        const deltaX = e.clientX -
            resizing.cursorOffset -
            (resizing.startX - resizing.cursorOffset);
        const newWidth = Math.max(50, resizing.initialWidth + deltaX);
        setColumnWidths((prev) => ({
            ...prev,
            [resizing.key]: newWidth,
        }));
    };
    const handleResizeEnd = () => {
        setResizing(null);
    };
    (0, react_1.useEffect)(() => {
        if (resizing) {
            currentWindow.document.addEventListener("mousemove", handleResizeMove);
            currentWindow.document.addEventListener("mouseup", handleResizeEnd);
            return () => {
                currentWindow.document.removeEventListener("mousemove", handleResizeMove);
                currentWindow.document.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [resizing]);
    const getColumnWidth = (column) => {
        if (columnWidths[column.key]) {
            return { width: `${columnWidths[column.key]}px` };
        }
        if (column.width !== undefined) {
            return { width: `${column.width}px` };
        }
        return { width: "auto" };
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "sunken-panel", style: { ...style, outline: "none" }, ref: tableRef, tabIndex: 0, children: (0, jsx_runtime_1.jsxs)("table", { className: "interactive", style: { width: "100%", tableLayout: "fixed" }, children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: columns.map((column) => ((0, jsx_runtime_1.jsxs)("th", { style: {
                                ...getColumnWidth(column),
                                position: "relative",
                                userSelect: "none",
                                cursor: "pointer",
                            }, onClick: () => handleSort(column.key), children: [column.header, sortConfig?.key === column.key && ((0, jsx_runtime_1.jsx)("span", { style: { marginLeft: "4px" }, children: sortConfig.direction === "asc" ? "↑" : "↓" })), (0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: "4px",
                                        cursor: "col-resize",
                                        backgroundColor: resizing?.key === column.key ? "#666" : "transparent",
                                    }, onMouseDown: (e) => handleResizeStart(e, column.key) })] }, column.key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: sortedData.map((row, rowIndex) => ((0, jsx_runtime_1.jsx)("tr", { className: selectedRowIndex === rowIndex ? "highlighted" : "", onClick: () => handleRowSelect(rowIndex), children: columns.map((column) => ((0, jsx_runtime_1.jsx)("td", { style: getColumnWidth(column), children: column.render
                                ? column.render(row, rowIndex)
                                : row[column.key] }, `${rowIndex}-${column.key}`))) }, rowIndex))) })] }) }));
};
exports.TableView = TableView;
