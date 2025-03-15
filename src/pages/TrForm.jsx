import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const TrForm = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [responses, setResponses] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  
  const handleTransactionTypeSelect = (value) => {
    setSelectedTransactionType(value);
  };
  const handleRemarksChange = (event, transactionId) => {
    const updatedData = feedbackData.map(transaction => {
      if (transaction._id === transactionId) {
        return { ...transaction, "Remarks (If any)": event.target.value };
      }
      return transaction;
    });
    
    // Optionally, set the updated data to the state if necessary
    setFeedbackData(updatedData);
  };
  
  const selectedTransaction = location.state?.selectedTransaction;

  // Fetch feedback data based on selected transaction
  useEffect(() => {
    if (!selectedTransaction?.Branch_Code) {
      console.log("No transaction selected or invalid Branch_Code");
      return;
    }

    axios
      .get(
        `http://localhost:5000/transaction-feedback?branchCode=${selectedTransaction.Branch_Code}`
      )
      .then((response) => {
        if (Array.isArray(response.data)) {
          console.log(response.data);
          setFeedbackData(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching feedback data:", error);
      });
  }, [selectedTransaction?.Branch_Code]);

  // Handle response change for all fields including Remarks
  const handleResponseChange = (transactionType, questionIdx, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${transactionType}-${questionIdx}`]: value,
    }));
  };

  function calculateScore(question, selectedOption) {
  if (!selectedOption) return 0;

  // Case 1: Yes/No or True/False (Full score if Yes/True, otherwise 0)
  if (["Yes", "True"].includes(selectedOption)) return Number(question.Score);
  if (["No", "False"].includes(selectedOption)) return 0;

  // Case 2: 0-10 Scale (Apply formula)
  const numericValue = parseFloat(selectedOption);
  if (!isNaN(numericValue)) {
    return (numericValue / 10) * Number(question.Score);
  }

  // Case 3: Drop Box (Check if score is an array and find matching score)
  if (Array.isArray(question.Score) && question.Options) {
    const index = question.Options.indexOf(selectedOption);
    if (index !== -1) {
      return question.Score[index]; // Assign the correct score from the array
    }
  }

  return 0; // Default: No score if invalid selection
}


const handleSubmit = () => {
  const finalData = {
    BranchInfo: {
      Branch_Code: selectedTransaction.Branch_Code,
      Branch_Name: selectedTransaction.Branch_Name,
      Region_Name: selectedTransaction.Region_Name,
      Year: selectedTransaction.Year,
      Quarter: selectedTransaction.Qtr,
      Month: selectedTransaction.Month,
    },
    "Customer/Rep/MysteryShopperDetails": {},
    Feedback: {},
  };

  // Combine feedbackData with fallbackData to ensure all transaction types are present
  const combinedData = [...feedbackData];

  feedbackData.forEach((transaction) => {
    const index = combinedData.findIndex(
      (item) => item.Transaction_Type === transaction.Transaction_Type
    );
    if (index !== -1) {
      combinedData[index] = transaction; // Override with actual data if available
    } else {
      combinedData.push(transaction); // Add missing transaction types
    }
  });

  combinedData.forEach((transaction) => {
    const transactionType = transaction.Transaction_Type;
    const feedbackOptions = {};

    transaction.Questions.forEach((question, questionIdx) => {
      const key = `${transactionType}-${questionIdx}`;
      const selectedOption = responses[key];

      if (selectedOption) {
        feedbackOptions[question.category] = {
          selectedOption,
          score: question.Score, // Original score from backend
          finalScore: calculateScore(question, selectedOption), // Computed score
        };
      }
    });

    const remarksKey = `${transactionType}-Remarks`;
    if (responses[remarksKey]) {
      feedbackOptions["Remarks"] = responses[remarksKey];
    }

    if (Object.keys(feedbackOptions).length > 0) {
      finalData.Feedback[transactionType] = feedbackOptions;
    }
  });

  Object.keys(responses).forEach((key) => {
    if (key.includes("Feedback_Type")) {
      const transactionType = key.split("-")[0];
      const feedbackType = responses[key];

      const dynamicField = {
        Feedback_Type: feedbackType,
      };

      if (["Customer Feedback", "Representative Feedback"].includes(feedbackType)) {
        dynamicField.Name = responses[`${transactionType}-Name`] || "";
        dynamicField.Cell_Number = responses[`${transactionType}-Cell_Number`] || "";
      } else if (feedbackType === "Mystery Shopping") {
        dynamicField.Staff_Name = responses[`${transactionType}-Staff_Name`] || "";
      }

      finalData["Customer/Rep/MysteryShopperDetails"][transactionType] = dynamicField;
    }
  });

  console.log("Final Data Ready for Submission:", JSON.stringify(finalData, null, 2));
};

  
  if (!selectedTransaction) {
    return (
      <div>
        No transaction selected.{" "}
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (feedbackData.length === 0) {
    return <div>Loading feedback...</div>;
  }

  return (
    <div className="dynamic-form">
      <h2>Transaction Feedback Form</h2>
      <div className="transaction-form">
        <h2>
          Transaction Form for Branch: {selectedTransaction.Branch_Code}
        </h2>
        <p>
          Branch Name: <span>{selectedTransaction.Branch_Name}</span>
        </p>
        <p>
          Region Name: <span>{selectedTransaction.Region_Name}</span>
        </p>
        <p>
          Year: <span>{selectedTransaction.Year}</span>
        </p>
        <p>
          Quarter: <span>{selectedTransaction.Qtr}</span>
        </p>
        <p>
          Month: <span>{selectedTransaction.Month}</span>
        </p>
      </div>
      
      {/* Dropdown to select Transaction Type */}
      <div className="form-group2">
        <label>Select Transaction Type</label>
        <select
          className="ttype"
          onChange={(e) => handleTransactionTypeSelect(e.target.value)}
          value={selectedTransactionType}
        >
          <option value="">Select a Transaction Type</option>
          {feedbackData.slice(0, 3).map((transaction, idx) => (
            <option key={idx} value={transaction.Transaction_Type}>
              {transaction.Transaction_Type}
            </option>
          ))}
        </select>
      </div>

      {/* Render selected Transaction Type and always display the rest */}
      {feedbackData.map((transaction, idx) => {
        if (idx < 3 && transaction.Transaction_Type !== selectedTransactionType) {
          return null; // Hide unselected types for the first three
        }

        return (
          <div key={idx} className="transaction-section">
            <h3>{transaction.Transaction_Type}</h3>

            {/* Render Counter Transaction Feedback Fields */}
            {transaction.Transaction_Type ===
              "Counter Transaction Feedback from Customer /Rep / Mystery Shopping" && (
              <div className="form-group2">
                <label>Feedback Type</label>
                <select
                  onChange={(e) =>
                    handleResponseChange(
                      transaction.Transaction_Type,
                      "Feedback_Type",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Feedback Type</option>
                  <option value="Customer Feedback">Customer Feedback</option>
                  <option value="Representative Feedback">Representative Feedback</option>
                  <option value="Mystery Shopping">Mystery Shopping</option>
                </select>

                {responses[`${transaction.Transaction_Type}-Feedback_Type`] ===
                  "Customer Feedback" ||
                responses[`${transaction.Transaction_Type}-Feedback_Type`] ===
                  "Representative Feedback" ? (
                  <>
                    <div className="form-group2">
                      <input
                        type="text"
                        maxLength="60"
                        placeholder="Customer/Representative Name"
                        onChange={(e) =>
                          handleResponseChange(
                            transaction.Transaction_Type,
                            "Name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-group2">
                      <input
                        type="tel"
                        pattern="[0-9]{11}"
                        maxLength="11"
                        placeholder="Contact Number"
                        onChange={(e) =>
                          handleResponseChange(
                            transaction.Transaction_Type,
                            "Cell_Number",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </>
                ) : responses[`${transaction.Transaction_Type}-Feedback_Type`] ===
                  "Mystery Shopping" ? (
                  <div className="form-group2">
                    <input
                      type="text"
                      placeholder="Mystery Shopper Name"
                      maxLength="40"
                      onChange={(e) =>
                        handleResponseChange(
                          transaction.Transaction_Type,
                          "Staff_Name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Render Remittance Type Dropdown if Transaction_Type is "Remittance" */}
            {transaction.Transaction_Type === "Remittance" && (
              <div className="form-group2">
                <label>MTO Name</label>
                <select
                  onChange={(e) =>
                    handleResponseChange(
                      transaction.Transaction_Type,
                      "Remittance_Type",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select MTO Name</option>
                  {transaction.Remittance_Type.map((type, typeIdx) => (
                    <option key={typeIdx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Render Drop Box specific logic */}
            {transaction.Transaction_Type === "Drop Box" && (
              <div className="form-group2">
                {/* Dropdown for selecting category */}
                <label>Select Drop Box Time</label>
                <select
                  onChange={(e) =>
                    handleResponseChange(
                      transaction.Transaction_Type,
                      "Category",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Category</option>
                  {transaction.Questions.map((question, qIdx) => (
                    <option key={qIdx} value={question.category}>
                      {question.category}
                    </option>
                  ))}
                </select>

                {/* Render options as radio buttons for the selected category */}
                {responses[`${transaction.Transaction_Type}-Category`] &&
                  transaction.Questions.map((question, qIdx) => {
                    if (
                      question.category ===
                      responses[`${transaction.Transaction_Type}-Category`]
                    ) {
                      return (
                        <div key={qIdx} className="form-group2">
                          <label>{question.category}</label>
                          {question.Options.map((option, optIdx) => (
                            <label key={optIdx}>
                              <input
                                type="radio"
                                name={`${transaction.Transaction_Type}-${qIdx}`}
                                value={option}
                                onChange={(e) =>
                                  handleResponseChange(
                                    transaction.Transaction_Type,
                                    qIdx,
                                    e.target.value
                                  )
                                }
                              />{" "}
                              {option}
                            </label>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}

            {/* Render other questions for each transaction type */}
            {transaction.Transaction_Type !== "Drop Box" &&
              transaction.Questions.map((question, qIdx) => (
                <div key={qIdx} className="form-group2">
                  <label>{question.category}</label>
                  {Array.isArray(question.Options) ? (
                    question.Options.length === 2 ? (
                      // Render radio buttons for Yes/No questions
                      question.Options.map((option, optIdx) => (
                        <span>
                          <input
                          key={optIdx}
                            type="radio"
                            name={`${transaction.Transaction_Type}-${qIdx}`}
                            value={option}
                            onChange={(e) =>
                              handleResponseChange(
                                transaction.Transaction_Type,
                                qIdx,
                                e.target.value
                              )
                            }
                          />{" "}
                          {option}
                        </span>
                      ))
                    ) : (
                      // Render dropdown for multiple options
                      <select
                        onChange={(e) =>
                          handleResponseChange(
                            transaction.Transaction_Type,
                            qIdx,
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {question.Options.map((option, optIdx) => (
                          <option key={optIdx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <p>No options available</p>
                  )}
                 
              
              <input
              htmlFor={`remarks-${transaction._id}`}
              placeholder="Remarks (If any):"
              className="remarks"
                type="text"
                id={`remarks-${transaction._id}`}
                onChange={(e) => handleRemarksChange(e, transaction._id)} // Handle remarks change
              />
            
                </div>
              ))}

            {/* Render Remarks input field if present */}
            
              
            
          </div>
        );
      })}

      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default TrForm;
