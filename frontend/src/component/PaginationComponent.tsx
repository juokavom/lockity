import { useEffect, useState } from 'react';
import {
    PaginationItem, PaginationLink, Pagination
} from 'reactstrap';

interface IPaginationProps {
    total: number,
    chunkSize: number,
    selected: number,
    fetchItems: (offset: number, limit: number, selected: number) => void
}

function getLowerIndex(selected: number, total: number) {
    if (total < 5) return 1;
    if (selected > 2 && selected <= total - 2) {
        return selected - 2;
    } else if (selected > total - 2) {
        return total - 4;
    }
    return 1;
}

export default function CustomPagination(props: IPaginationProps) {
    const [totalPages] = useState<number>(Math.ceil(props.total / props.chunkSize))

    const [paginations, setPaginations] = useState<JSX.Element[] | null>(null)

    useEffect(() => {
        const pages = totalPages > 5 ? 5 : totalPages
        const lower = getLowerIndex(props.selected, totalPages)

        const paginations = Array.from(Array(pages).keys()).map((page: number) => {
            const current = lower + page
            return (
                <PaginationItem key={current} active={props.selected === current}>
                    <PaginationLink onClick={() => {
                        props.fetchItems((current - 1) * props.chunkSize, props.chunkSize, current)
                    }}>
                        {current}
                    </PaginationLink>
                </PaginationItem>
            );
        })

        setPaginations(paginations)

    }, [props.selected])


    return (
        <div className="center-horizontally" style={{ marginTop: "2rem" }}>
            <Pagination>
                <PaginationItem disabled={props.selected === 1}>
                    <PaginationLink
                        first
                        onClick={() => {
                            const selected = 1
                            props.fetchItems((selected - 1) * props.chunkSize, props.chunkSize, selected)
                        }}
                    />
                </PaginationItem>
                <PaginationItem disabled={props.selected === 1}>
                    <PaginationLink
                        previous
                        onClick={() => {
                            const selected = props.selected - 1
                            props.fetchItems((selected - 1) * props.chunkSize, props.chunkSize, selected)
                        }}
                    />
                </PaginationItem>
                {paginations && paginations}
                <PaginationItem disabled={props.selected >= totalPages}>
                    <PaginationLink
                        next
                        onClick={() => {
                            const selected = props.selected + 1
                            props.fetchItems((selected - 1) * props.chunkSize, props.chunkSize, selected)
                        }}
                    />
                </PaginationItem>
                <PaginationItem disabled={props.selected >= totalPages}>
                    <PaginationLink
                        last
                        onClick={() => {
                            const selected = totalPages
                            props.fetchItems((selected - 1) * props.chunkSize, props.chunkSize, selected)
                        }}
                    />
                </PaginationItem>
            </Pagination>
        </div>
    );
}