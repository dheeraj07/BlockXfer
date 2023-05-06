import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../components/Auth";
import { ethers } from "ethers";

function User() {
  const [address, setAddress] = useState();
  const auth = useAuth();

  async function updateAddress() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);
    setAddress(signer._address);
  }

  useEffect(() => {
    const setAddressAsync = async () => {
      await updateAddress();
    };
    setAddressAsync();
  }, []);

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="4">
            <Card className="card-user">
              <div className="card-image">
                <img alt="..." src={require("../assets/img/eth.jpeg")}></img>
              </div>
              <Card.Body>
                <div className="user author">
                  <a onClick={(e) => e.preventDefault()}>
                    <img
                      className="avatar border-gray"
                      src={require("../assets/img/eth.jpeg")}
                    ></img>
                    <h5 className="title">{address}</h5>
                  </a>
                  <p className="description">{auth.mobileNumber}</p>
                </div>
              </Card.Body>
              <hr></hr>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default User;
