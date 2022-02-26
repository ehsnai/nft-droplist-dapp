import { useState, useEffect } from "react"
import Web3 from "web3"
import { useForm } from 'react-hook-form';
import contract from "../contract/contract.json"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import moment from 'moment'
import "../styles/styles.css"
import Spacer from "./spacer"

const initialInfo = {
    connected: false,
    status: null,
    account: null,
    contract: null,
}

const initialDrop = {
    loading: false,
    list: []
}

const DropList = () => {
    const [info, setInfo] = useState(initialInfo);
    const [drops, setDrops] = useState(initialDrop)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        init()
        initOnchange()
    }, [])

    useEffect(() => {
        if (info.contract) {
            getDrops()
        }
    }, [info])

    const init = async () => {
        if (window.ethereum?.isMetaMask) {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            const networkId = await window.ethereum.request({
                method: 'net_version',
            })

            if (networkId == 97) {
                let web3 = new Web3(window.ethereum)
                setInfo({
                    ...initialInfo,
                    connected: true,
                    account: accounts[0],
                    contract: new web3.eth.Contract(contract.abi, contract.address)

                })
            }
            else {
                setInfo({ ...initialInfo, status: "Metamask have to be on BSC-testnet" })
            }
        } else {
            setInfo({ ...initialInfo, status: "You need metamask" })
        }
    }
    const initOnchange = () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", () => {
                window.location.reload()
            });
            window.ethereum.on("chainChanged", () => {
                window.location.reload()
            });
        }
    }
    const getDrops = async () => {
        console.log("stack sended for getDrops =====>")
        setDrops((prevState) => ({ ...prevState, loading: true }))
        info.contract.methods.getDrops().call().then(function (res) {
            setDrops({ loading: false, list: res })
            console.log("responde ======>", res)
        }).catch(function (err) {
            setDrops(initialDrop)
        });
        console.log("finished");
    }

    const onSubmit = (data) => {
        let newData = {
            imageUrl: data.imageUrl,
            name: data.name,
            description: data.description,
            social_1: data.social_1,
            social_2: data.social_2,
            website: data.website,
            price: data.price,
            supply: Number(data.supply),
            presale: Number(data.presale),
            sale: Number(data.sale),
            chain: Number(data.chain),
            approved: false,
        }

        console.log("add drop stack sended ======>")
        info.contract.methods.addDrop(Object.values(newData))
            .send({ from: info.account }).then(function (res) {
                console.log("add drop ======>", res)
            }).catch(function (err) {
            });
    };

    return (
        <div className={"container"}>
            <div className={"header"}>
                <h3>Nft Drops</h3>
            </div>
            <div className={"content"}>

                <Tabs>
                    <TabList>
                        <Tab>Drops list</Tab>
                        <Tab>Add Drops</Tab>
                    </TabList>

                    <TabPanel>

                        {drops.list.map((item) => {
                            return (
                                <div className={"dropContiner"}>
                                    <div>
                                        <img className={"dropImage"} src="https://picsum.photos/400/400"></img>
                                        <Spacer />
                                        <p className={"dropText"}>{item.name}</p>
                                        <Spacer />
                                        <p className={"dropText"}>{item.description}</p>
                                    </div>

                                    <div>
                                        <a className={"dropText"} href={item.social_1} target="_blank" >{item.social_1}</a>
                                        <Spacer />
                                        <a className={"dropText"} href={item.social_2} target="_blank">{item.social_2}</a>
                                        <Spacer />
                                        <a className={"dropText"} href={item.website} target="_blank">{item.website}</a>
                                    </div>

                                    <div>
                                        <p className={"dropText"}>Total Supply : {item.supply}</p>
                                        <Spacer />
                                        <p className={"dropText"}>Pre-sale Date : {moment(item.presale).format("MMMM Do YYYY, h:mm:ss a")}</p>
                                        <Spacer />
                                        <p className={"dropText"}>Sale Date : {moment(item.sale).format("MMMM Do YYYY, h:mm:ss a")}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </TabPanel>
                    <TabPanel>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <label>Image URL</label>
                            <input {...register('imageUrl', { required: true })} />
                            {errors.imageUrl && <p className={"error"}>Last name is required.</p>}
                            <br />

                            <label>Name</label>
                            <input {...register('name', { required: true })} />
                            {errors.name && <p className={"error"}>Last name is required.</p>}
                            <br />

                            <label>Description</label>
                            <input {...register('description')} />
                            <br />

                            <label>Socail 1</label>
                            <input {...register('social_1',)} />
                            <br />

                            <label>Socail 2</label>
                            <input {...register('social_2',)} />
                            <br />

                            <label>Website</label>
                            <input {...register('website',)} />
                            <br />

                            <label>Price</label>
                            <input {...register('price', { required: true })} />
                            {errors.price && <p className={"error"}>Price is required.</p>}
                            <br />

                            <label>Supply</label>
                            <input {...register('supply', { required: true, pattern: /\d+/ })} />
                            {errors.supply && <p className={"error"}>Supply Should be number</p>}
                            <br />

                            <label>Presale</label>
                            <input {...register('presale', { required: true })} />
                            {errors.supply && <p className={"error"}>Presale Should be date</p>}
                            <br />

                            <label>Sale</label>
                            <input {...register('sale', { required: true })} />
                            {errors.price && <p className={"error"}>Sale is required.</p>}
                            <br />

                            <label>Chain</label>
                            <input {...register('chain', { required: true })} />
                            {errors.price && <p className={"error"}>Chain is required.</p>}
                            <br />
                            <input type="submit" />
                        </form>
                    </TabPanel>
                </Tabs>
            </div>
        </div>

    );
}
export default DropList

