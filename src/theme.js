// /src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2", // yoki siz ishlatgan ko'k
            contrastText: "#fff"
        },
        background: {
            default: "#f4f6f8", // sahifa fon (yumshoq kulrang)
            paper: "#ffffff"
        },
        text: {
            primary: "#0f1720",
            secondary: "#556074"
        }
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 6px 18px rgba(15,23,42,0.06)"
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(145,158,171,0.12)"
                }
            }
        }
    },
    typography: {
        h4: { fontWeight: 700, fontSize: "1.6rem" },
        h6: { fontWeight: 600 },
        body1: { color: "#0f1720" }
    }
});

export default theme;
