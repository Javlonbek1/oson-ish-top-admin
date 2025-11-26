import FinanceStats from "./component/FinanceState";
// import FinanceStats2 from "./component/FinanceState2";
// import FinanceStatsGPT from "./component/finance/FinanceStats";
import axiosInstance from "../../api/axiosInstance";

export default function FinancePage() {

    // return (
    //     <div style={{ padding: 24 }}>
    //         <FinanceStatsGPT
    //             baseUrl="admin/finance"
    //             initialYear={2025}
    //             onPeriodClick={(periodLabel, summary) => {
    //                 console.log('Clicked period:', periodLabel, summary);
    //             }}
    //             axiosInstance={axiosInstance}
    //         />
    //     </div>
    // );

    // return <FinanceStats2
    //     baseUrl="admin/finance"           // Optional: API base URL
    //     initialYear={2025}                   // Optional: Default year
    //     onPeriodClick={(period, summary) => console.log(period, summary)}
    //     axiosInstance={axiosInstance}         // Optional: Axios instance
    // />

    return <FinanceStats
        baseUrl="admin/finance"           // Optional: API base URL
        initialYear={2025}                   // Optional: Default year
        
        onPeriodClick={(period, summary) => {  // Optional: Click callback
            console.log(period, summary);
        }}
        axiosInstance={axiosInstance}         // Optional: Axios instance
    />;
}